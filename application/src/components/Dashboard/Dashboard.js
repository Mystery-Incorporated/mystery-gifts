import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Link, Route, Switch, BrowserRouter } from 'react-router-dom';


import "./Dashboard.css";

import { 
    grommet, 
    Grommet, 
    Text, 
    Box, 
    Button, 
    TextInput, 
    Image, 
    ResponsiveContext,
    Layer,
    FormField
} from 'grommet';

import { Login, Menu, Logout, Add, Close, Analytics, Chat, Clock, Configure, Help, Projects, Search } from "grommet-icons";

import {Banner, BannerAlt} from 'Media';

import ContentLoader from 'react-content-loader';
import Avatar from 'react-avatar';
import {Spinner} from 'Components';

import { WithContext as ReactTags } from 'react-tag-input';

import { toast } from "react-toast";

import isUrl from 'is-url'

const KeyCodes = {
  comma: 188,
  enter: 13,
};

const delimiters = [KeyCodes.comma, KeyCodes.enter];

const AvatarWithText = props => (
    <ContentLoader 
        speed={2}
        width={400}
        height={70}
        viewBox="0 0 400 65"
        backgroundColor="#f3f3f3"
        foregroundColor="#ecebeb"
        {...props}
    >
        <circle cx="30" cy="30" r="28" /> 
        <rect x="70" y="12" rx="0" ry="0" width="240" height="14" /> 
        <rect x="70" y="38" rx="0" ry="0" width="172" height="8" />
    </ContentLoader>
)

const SkeletonBox = props => (
    <ContentLoader 
        speed={2}
        width={400}
        height={70}
        viewBox="0 0 400 65"
        backgroundColor="#f3f3f3"
        foregroundColor="#ecebeb"
        {...props}
    >
        <rect x="0" y="0" rx="3" ry="3" width="92" height="20" /> 
        <rect x="106" y="0" rx="3" ry="3" width="170" height="20" />
    </ContentLoader>
)

const SkeletonWishList = props => (
    <ContentLoader 
        speed={2}
        width={400}
        height={70}
        viewBox="0 0 400 65"
        backgroundColor="#f3f3f3"
        foregroundColor="#ecebeb"
        {...props}
    >
        <rect x="0" y="0" rx="3" ry="3" width="180" height="11" /> 
        <rect x="200" y="0" rx="3" ry="3" width="80" height="11" /> 
        <rect x="300" y="0" rx="3" ry="3" width="90" height="11" /> 
        <rect x="1" y="23" rx="3" ry="3" width="40" height="11" />
        <rect x="51" y="23" rx="3" ry="3" width="40" height="11" />
        <rect x="101" y="23" rx="3" ry="3" width="40" height="11" />
        <rect x="151" y="23" rx="3" ry="3" width="40" height="11" />
        <rect x="201" y="23" rx="3" ry="3" width="40" height="11" />
  </ContentLoader>
)

class Dashboard extends Component {

    _isMounted = false;

    constructor(props) {
        super(props)
        this.state = {
            error: '',
            socket: null,
            loadingMembers: true,
            loadingWishlist: true,
            members: [],
            searchSuggestions: [],
            searchValue: "",
            showSuggestions:false,
            selectingMember:false,
            wishlist: [],
            error:'',
            addItem:false,
            addingItem: false,
            itemTitle: "",
            itemURL: "",
            itemCategories: [],
            itemMaxCost: "0",
            myWishList: true,
            currentMember: null,
            loadWishlistId:"",
            createList: false,
            creatingList: false,
            wishlistTitle: '',
            wishlistId: '',
            privateListLoaded: false
        };

        this.handleDelete = this.handleDelete.bind(this);
        this.handleAddition = this.handleAddition.bind(this);
        this.handleDrag = this.handleDrag.bind(this);
    }  

    handleDelete(i) {
        const tags  = this.state.itemCategories;
        this.setState({
            itemCategories: tags.filter((tag, index) => index !== i),
        });
    }

    handleAddition(tag) {
        this.setState(state => ({ itemCategories: [...state.itemCategories, tag] }));
    }

    handleDrag(tag, currPos, newPos) {
        const tags = [...this.state.itemCategories];
        const newTags = tags.slice();

        newTags.splice(currPos, 1);
        newTags.splice(newPos, 0, tag);

        // re-render
        this.setState({ itemCategories: newTags });
    }

    handleInputChange = (event) => {
        const { value, name } = event.target;
        this.setState({
            [name]: value
        });
    }

    onSubmit = (event) => {
        event.preventDefault();
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    loadMembers() {

        fetch('/api/users', {
            method: 'GET',
            headers: {
                'Accept': 'application/json, text/plain, */*',  // It can be used to overcome cors errors
                'Content-Type': 'application/json'
            }
        })
        .then(res => {
            this.setState({loadingMembers: false});
            return res.json();
        })
        .then(data => {
            if ('error' in data) {
                toast.error('Error loading members list.');
                this.setState({error: data.msg});
            }
            else {
                let myData = {
                    firstname: this.props.data.firstname,
                    lastname: this.props.data.lastname,
                    dob: this.props.data.dob,
                    avatar: this.props.data.avatar,
                    email: '',
                    myData: true,
                    username: this.props.data.username,
                    wishlist: this.props.data.wishlist
                };
                data.members.unshift(myData);
                this.setState({members:data.members, currentMember: myData, privateListLoaded:false}, () => {
                    this.loadWishList();
                });
            }
        }) 
        .catch(err => {
            console.log('Error loading members list, ', err);
            toast.error('Error loading members list.');
        });

    }

    loadWishList() {

        if (this.props.data.pid) {
            this.loadPrivateList(this.props.data.pid);
        }
        else if (this.props.data.id) {

            let member = this._loadWishList(this.props.data.id);

            if (member) {
                this.setState({loadingWishlist: false, myWishList:member.username === this.props.data.username, currentMember: member, wishlist: member.wishlist});

            }
            else {
                this.props.history.push("/l/" + this.props.data.username);
                this.setState({loadingWishlist: false, wishlist: this._loadWishList(this.props.data.username).wishlist});

            }
        }
        else {
            this.props.history.push("/l/" + this.props.data.username);
            this.setState({loadingWishlist: false, wishlist: this._loadWishList(this.props.data.username).wishlist});


        }
    }

    _loadWishList(id) {
        let obj = this.state.members.find(mem => mem.username === id);
        if (obj) {
            return obj;
        }
        else {
            return {wishlist:[]};
        }
    }

    componentDidMount() {
        this._isMounted = true;

        if (this._isMounted) {

            if (!this.props.data.id && !this.props.data.pid) {
                this.props.history.push("/l/" + this.props.data.username);
            }
            else {
                this.loadMembers();
            }
        }
    }    

    selectMember(member) {
        this.props.history.push("/l/" + member.username);
        this.setState({selectingMember: true, currentMember: member, loadingWishlist: true, privateListLoaded:false});
        fetch('/api/wish/' + member.email, {
            method: 'GET',
            headers: {
                'Accept': 'application/json, text/plain, */*',  // It can be used to overcome cors errors
                'Content-Type': 'application/json'
            }
        })
        .then(res => {
            this.setState({selectingMember: false, loadingWishlist: false});
            return res.json();
        })
        .then(data => {
            if ('error' in data) {
                this.setState({error: data.msg});
                toast.error('Error selecting memeber please try again.');
            }
            else {
                this.setState({wishlist:data.wishlist})
            }
        }) 
        .catch(err => {
            console.log('Error selecting member', err);
            toast.error('Error selecting memeber please try again.');
        });
    }

    updateSuggestions(value) {
        this.setState({searchValue: value});

        const inputValue = value.trim().toLowerCase();
        const inputLength = inputValue.length;

        let filtered = inputLength === 0 ? [] : this.state.members.filter(member =>
            member.firstname.toLowerCase().slice(0, inputLength) === inputValue || 
            member.lastname.toLowerCase().slice(0, inputLength) === inputValue 
        );

        this.setState({ searchSuggestions: filtered});
    }

    isNumeric(str) {
        if (typeof str != "string") return false // we only process strings!  
        return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
               !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
    }

    submitWish() {

        if (!this.isNumeric(this.state.itemMaxCost)) {
            this.setState({error:"Max Cost must be a valid price."})
        }
        else if (this.state.itemTitle === "" || this.state.itemURL === "" || this.state.itemMaxCost === "") {
            this.setState({error:"Fill out all fields."})
        }
        else {

            let maxCost = parseFloat(this.state.itemMaxCost);
            let tags = this.state.itemCategories.map(function(item) {
                return item['text'];
            });
            let url = this.state.itemURL;
            if (!isUrl(url)) {
                url = "#"
            }
            let wish = {
                title: this.state.itemTitle,
                url: url,
                maxCost: maxCost,
                tags: tags
            };

            
            if (this.state.privateListLoaded) {
                this.addToPrivateList(wish);
            }
            else {
                this.addToMyList(wish);
            }
        }
    }

    deleteWish(wish) {
        if (this.state.privateListLoaded) {
            this._deletePrivateWish(wish);
        }
        else {
            this._deleteWish(wish);
        }
    }

    _deleteWish(wish) {
        fetch('/api/wish/'+wish._id, {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json, text/plain, */*',  // It can be used to overcome cors errors
                'Content-Type': 'application/json'
            }
        })
        .then(res => {
            return res.json();
        })
        .then(data => {
            this.props.data.reloadWishlist();
            toast.success("Successfully deleted from your list.");
        }) 
        .catch(err => {
            console.log("Error deleting wish, ", err);
            toast.error('Error deleting wish.');
        });
    }

    _deletePrivateWish(wish) {
        fetch('/api/list/' + this.state.currentMember.username + "/" + wish._id, {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json, text/plain, */*',  // It can be used to overcome cors errors
                'Content-Type': 'application/json'
            }
        })
        .then(res => {
            return res.json();
        })
        .then(data => {
            this.props.data.reloadWishlist();
            toast.success("Successfully deleted from this private list.");
        }) 
        .catch(err => {
            console.log("Error deleting from private list, ", err);
            toast.error('Error deleting from private list.');
        });
    }

    addToMyList(wish) {
        fetch('/api/wish', {
            method: 'POST',
            body: JSON.stringify(wish),
            headers: {
                'Accept': 'application/json, text/plain, */*',  // It can be used to overcome cors errors
                'Content-Type': 'application/json'
            }
        })
        .then(res => {
            return res.json();
        })
        .then(data => {
            this.setState({addingItem: false, itemCategories:[], itemMaxCost:"", itemTitle:"", itemURL:""});
            toast.success("Item added to your list.");
            this.props.data.reloadWishlist();
        }) 
        .catch(err => {
            console.log("Error adding to list, ", err);
            toast.error('Error adding to list.');
        });
    }

    addToPrivateList(wish) {
        wish.id = this.state.currentMember.username;
        fetch('/api/list/wish', {
            method: 'POST',
            body: JSON.stringify(wish),
            headers: {
                'Accept': 'application/json, text/plain, */*',  // It can be used to overcome cors errors
                'Content-Type': 'application/json'
            }
        })
        .then(res => {
            return res.json();
        })
        .then(data => {
            this.setState({addingItem: false, itemCategories:[], itemMaxCost:"", itemTitle:"", itemURL:""});
            toast.success("Item added to private list.");
            this.props.data.reloadWishlist();
        }) 
        .catch(err => {
            console.log("Error adding to private list., ", err);
            toast.error('Error adding to private list.');
        });
    }

    loadPrivateList(id) {
        this.setState({loadingWishlist:true});
        fetch('/api/list/' + id, {
            method: 'GET',
            headers: {
                'Accept': 'application/json, text/plain, */*',  // It can be used to overcome cors errors
                'Content-Type': 'application/json'
            }
        })
        .then(res => {
            return res.json();
        })
        .then(data => {
            
            if ('error' in data) {
                
                this.setState({loadingWishlist: false, wishlist: this._loadWishList(this.props.data.username).wishlist});
                this.props.history.push("/l/" + this.props.data.username);
                toast.error("Invalid private list.");
            }
            else {
                let mockMember = {
                    firstname: data.title,
                    lastname: data.title,
                    dob: '1996-12-25',
                    avatar: '',
                    email: '',
                    username: data.id,
                    wishlist: data.wishlist
                }

                this.props.history.push("/pl/" + data.id);
                this.setState({myWishList :true, currentMember: mockMember, loadingWishlist: false, privateListLoaded:true, wishlist:mockMember.wishlist});
            }

        }) 
        .catch(err => {
            this.setState({loadingWishlist: false, wishlist: this._loadWishList(this.props.data.username).wishlist});
            this.props.history.push("/l/" + this.props.data.username);
            toast.error('Error loading private list.');
        });
    }

    createWishlist() {
        this.setState({creatingList: true});

        let lst = {
            title: this.state.wishlistTitle,
            id: this.state.wishlistId,
        }

        fetch('/api/list', {
            method: 'POST',
            body: JSON.stringify(lst),
            headers: {
                'Accept': 'application/json, text/plain, */*',  // It can be used to overcome cors errors
                'Content-Type': 'application/json'
            }
        })
        .then(res => {
            return res.json();
        })
        .then(data => {
            this.setState({loadingWishlist: true});
            this.loadPrivateList(lst.id);
            toast.success("Successfully created private list.");
        }) 
        .catch(err => {
            console.log("Error creating wish, ", err);
            toast.error('Error creating wish.');
        });
    }

    render() {    
        
        let searchbar = 
        <div
            style={{
                width:"100%",
                borderBottom: "1px solid #ddd",
                height:"auto"
            }}
        >
            <TextInput
                icon={<Search color={this.props.data.color4} size="20px"/>}
                placeholder="Search for a member"
                plain
                value={this.state.searchValue}
                onChange={event => {this.updateSuggestions(event.target.value);}}
                onFocus={() => this.setState({showSuggestions:true})}
                onBlur={() => setTimeout(() => {this.setState({showSuggestions:false})},100)}
                size="small"
            />
            {this.state.showSuggestions &&
                <Box
                    width="100%"
                    height={{"min":"75px", "max":"400px"}}
                    pad={{
                        "top":"small",
                        "bottom":"small",
                        "left":"medium",
                        "right":"medium",
                    }}
                    overflow={{"vertical":"auto"}}
                >
                    {this.state.searchSuggestions.map(member => {
                        return (
                            <Box
                                width="100%"
                                height={{"min":"60px"}}
                                direction="row"
                                justify="start"
                                align="center"
                                gap="medium"
                                onClick={() => {
                                    if (member.myData) this.setState({myWishList:true});
                                    else this.setState({myWishList:false});
                                    this.selectMember(member);
                                }}
                                key={member.lastname+member.dob+"-search"}
                            >
                                <Avatar 
                                    name={this.props.data.getNameAlt(member.firstname + " " + member.lastname)}
                                    src={member.avatar} 
                                    size="50" 
                                    round={true}
                                />
                                <Text as="div" size="medium" color={this.props.data.color3} weight="bold">
                                    {this.props.data.getNameAlt(member.firstname + " " + member.lastname)}
                                </Text>
                            </Box>
                        );
                    })}
                </Box>
            }
        </div>;

        let sidebar = 
        <Box
            width={{"min":"384px"}}
            height="100%"
            pad="small"
        >
            { this.state.loadingMembers ?
            
                <Box
                    width="100%"
                    height="100%"
                    pad="small"
                >
                    <Box height={{"min": "70px"}}><AvatarWithText /></Box>
                    <Box height={{"min": "70px"}}><AvatarWithText /></Box>
                    <Box height={{"min": "70px"}}><AvatarWithText /></Box>
                    <Box height={{"min": "70px"}}><AvatarWithText /></Box>
                    <Box height={{"min": "70px"}}><AvatarWithText /></Box>
                </Box>
            :
                <Box
                    width="100%"
                    height="100%"
                    gap="xsmall"
                    overflow={{"vertical":"auto"}}
                >
                    {this.state.members.map(member => {
                        return (
                            <Box
                                width="100%"
                                height={{"min": "70px"}}
                                direction="row"
                                justify="between"
                                align="center"
                                gap="xsmall"
                                className="hover-button"
                                pad="small"
                                round="8px"
                                onClick={() => {
                                    if (member.myData) this.setState({myWishList:true});
                                    else this.setState({myWishList:false});
                                    this.selectMember(member);
                                }}
                                key={member.lastname+member.dob}
                            >    
                                <Box
                                    height="100%"
                                    direction="row"
                                    justify="start"
                                    align="center"
                                    gap="medium"
                                >
                                    <Avatar 
                                        name={this.props.data.getNameAlt(member.firstname + " " + member.lastname)}
                                        src={member.avatar} 
                                        size="50" 
                                        round={true}
                                    />
                                    <Box
                                        direction="column"
                                        justify="start"
                                        align="start"
                                        gap="xxsmall"
                                        width="100%"
                                    >
                                        <Box width="100%">
                                            <Text size="medium" color={this.props.data.color3} weight="bold">
                                                {this.props.data.getNameAlt(member.firstname + " " + member.lastname)}
                                            </Text>
                                        </Box>
                                        <Box width="100%" margin={{"left":"1px"}}>
                                            <Text size="xsmall" color={this.props.data.color4} weight="bold">
                                                {this.props.data.formatDOB(member.dob)}
                                            </Text>
                                        </Box>

                                    </Box>

                                </Box>
                                <Box
                                    height="100%"
                                >
                                    <Text size="10px" color={this.props.data.color4}>{this.props.data.getRemainingDays(member.dob)} days</Text>
                                </Box>
                            </Box>
                        );
                    })}

                </Box>
            }
        </Box>;

        let content = (responsive) => {
        return (
            <Box
                direction="column"
                justify="start"
                flex={{"grow":1, "shrink":1}}
                pad={{"bottom":"10px"}}
                overflow={{"vertical":"auto"}}
            >
                {/** Content starts here */}
                {/** 3 columns of content */}
                {/**    1 - private lists */}
                {/**    2 - list informations and adding to list */}
                {/**    3 - wish list content */}
                <Box
                    width="100%"
                    height="100%"
                    direction={responsive === "small" ? "column-reverse":"column"}
                    gap="medium"
                    pad="small"
                    overflow={{"vertical":"auto"}}
                >
                    {/**    1 - private lists */}
                    <Box
                        width="100%"
                        direction={responsive === "small" ? "row-reverse":"row"}
                        pad="xsmall"
                        gap="small"
                        align="center"
                    >

                        <Box
                            width={{"min":"140px"}}
                        >
                            <TextInput
                                
                                icon={<Menu color={this.props.data.color4} size="20px"/>}
                                placeholder="Wishlist ID"
                                plain
                                value={this.state.loadWishlistId}
                                onChange={event => {this.setState({loadWishlistId: event.target.value});}}
                                onKeyPress={event => {
                                    if (event.key === 'Enter') {
                                        this.loadPrivateList(this.state.loadWishlistId);
                                    }
                                }}
                                size="small"
                            />
                        </Box>

                        <Box
                            width={{"min":"80px"}}
                            height={{"min":"10px"}}
                            onClick={() => {this.loadPrivateList(this.state.loadWishlistId)}}
                            pad={{
                                "left":"small",
                                "right":"small",
                                "top":"xsmall",
                                "bottom":"xsmall",
                            }}
                            background={this.props.data.color2}
                            direction="row"
                            justify="center"
                            align="center"
                            round="50px"
                        >
                            <Text color="#eee" size="small">Submit</Text>
                        </Box>
                        <Box
                            width={{"min":"100px"}}
                            height={{"min":"10px"}}
                            onClick={() => this.setState({createList:true})}
                            pad={{
                                "left":"small",
                                "right":"small",
                                "top":"xsmall",
                                "bottom":"xsmall",
                            }}
                            background="#000"
                            direction="row"
                            justify="center"
                            align="center"
                            round="50px"
                        >
                            <Text color="#eee" size="small">Create list</Text>
                        </Box>
                    </Box>
                    {/**    2 - list informations and adding to list */}
                    <Box
                        width="100%"
                        direction={responsive === "small" ? "row-reverse":"row"}
                        pad="xsmall"
                        gap="large"
                        align="center"
                    >

                        {this.state.loadingWishlist && 
                            <SkeletonBox />
                        }

                        {!this.state.loadingWishlist && 
                            <Box
                                height={{"min":"10px"}}
                                width={{"min":"110px"}}
                                onClick={() => this.setState({addItem:true})}
                                pad={{
                                    "left":"small",
                                    "right":"small",
                                    "top":"xsmall",
                                    "bottom":"xsmall",
                                }}
                                background="#000"
                                direction="row"
                                justify="center"
                                align="center"
                                round="50px"
                            >
                                <Text color="#eee" size="small">Add item</Text>
                            </Box>
                        }
                        {(!this.state.loadingWishlist && this.state.currentMember) && 
                            <Box
                                height={{"min":"30px"}}
                                direction="row"
                                justify="center"
                                align="center"
                                gap="small"
                            >
                                { this.state.privateListLoaded ? 
                                    <Text color={this.props.data.color3} size="xlarge">Private list: <Text color={this.props.data.color2} size="xlarge">{this.props.data.getNameAlt(this.state.currentMember.firstname)}</Text></Text>
                                :
                                    <Text color={this.props.data.color2} size="xlarge">{this.props.data.getNameAlt(this.state.currentMember.firstname)}'s <Text color={this.props.data.color3} size="xlarge">list</Text></Text>
                                }
                            </Box>
                        }
                    </Box>
                    {/**    3 - wish list content */}
                    <Box
                        width="100%"
                        height="100%"
                        pad={{"left":"5px"}}
                        margin={{"top":"10px", "bottom":"10px"}}
                        overflow={{"vertical":"auto"}}
                    >
                        {(!this.state.loadingWishlist && (!this.state.wishlist || this.state.wishlist.length == 0)) && 
                            <Text color={this.props.data.color4} size="xlarge" >There is nothing in this wish list.</Text>
                        }

                        {this.state.loadingWishlist &&
                            <Box
                                width="100%"
                                height="100%"
                                pad="small"
                            >
                                <Box height={{"min":"80px"}}><SkeletonWishList /></Box>
                                <Box height={{"min":"80px"}}><SkeletonWishList /></Box>
                                <Box height={{"min":"80px"}}><SkeletonWishList /></Box>
                                <Box height={{"min":"80px"}}><SkeletonWishList /></Box>
                                <Box height={{"min":"80px"}}><SkeletonWishList /></Box>
                            </Box>
                        }

                        {!this.state.loadingWishlist && this.state.wishlist.map((wish, i) => {
                            return (
                                <Box
                                    width="100%"
                                    height={{"min":"80px"}}
                                    key={"wish-" + wish.url + "-" + i}
                                    direction="row"
                                    justify="start"
                                    align="center"
                                    className="hover-button"
                                    pad = "small"
                                    gap="small"
                                    round="12px"
                                >
                                    
                                    <Box
                                        width={{"min": "25px"}}
                                        height={{"min": "25px"}}
                                        pad="2px"
                                        direction="row"
                                        justify="center"
                                        align="center"
                                        round="12px"
                                        border={{
                                            color:"#777",
                                            side:"all",
                                            size: "0px"
                                        }}
                                        onClick={() => this.state.myWishList ? this.deleteWish(wish) : this.addToMyList(wish)}
                                        className="highligh hover-button-red"
                                    >
                                        { this.state.myWishList ? <Close color="#777" size="15px" /> : <Add color="#777" size="15px" />}
                                    </Box>

                                    {this.state.privateListLoaded && 
                                        <Box
                                            width={{"min": "25px"}}
                                            height={{"min": "25px"}}
                                            pad="2px"
                                            direction="row"
                                            justify="center"
                                            align="center"
                                            round="12px"
                                            border={{
                                                color:"#777",
                                                side:"all",
                                                size: "0px"
                                            }}
                                            onClick={() => this.addToMyList(wish)}
                                            className="highligh hover-button-red"
                                        >
                                            <Add color="#777" size="15px" />
                                        </Box>
                                    }
                                    
                                    <Box
                                        direction="column"
                                        justify="start"
                                        align="start"
                                        gap="small"
                                        height="100%"
                                        flex="grow"
                                        pad="xsmall"
                                    >
                                        <Box
                                            direction="row"
                                            gap="medium"
                                            align="center"
                                            justify="start"
                                        >
                                            <Box width={{"min": "160px"}} onClick={() => window.open(wish.url, "_blank")}><Text>{wish.title}</Text></Box>
                                            <Box
                                                width={{"min": "80px"}}
                                                background={this.props.data.color2}
                                                pad={{
                                                    "top":"2px",
                                                    "bottom":"2px",
                                                    "left":"12px",
                                                    "right":"12px",

                                                }}
                                                round="2px"
                                                direction="row"
                                                justify="center"
                                                align="center"
                                                onClick={() => {

                                                    const el = document.createElement('textarea');
                                                    el.value = wish.url;
                                                    document.body.appendChild(el);
                                                    el.select();
                                                    el.setSelectionRange(0, 99999);;
                                                    document.execCommand('copy');
                                                }}
                                                round="2px"
                                            >
                                                <Text size="12px" color="#eee">Copy link</Text>
                                            </Box>

                                            {responsive === "large" &&
                                                <Text onClick={(e) => {console.log(e)}} size="12px" color={this.props.data.color4}>{wish.url.substring(0, 100)} {wish.url.length > 100 ? "..." : ""}</Text> 
                                            }
                                        </Box>
                                        <Box
                                            direction="row"
                                            gap="small"
                                            align="center"
                                            justify="start"

                                        >
                                            {wish.tags.map((tag, i) => {
                                                return (
                                                    <Box
                                                        background="#fcf8e1"
                                                        pad={{
                                                            "top":"2px",
                                                            "bottom":"2px",
                                                            "left":"12px",
                                                            "right":"12px",
        
                                                        }}
                                                        round="2px"
                                                        direction="row"
                                                        justify="center"
                                                        align="center"
                                                        key={"wish-tag-" + i + "-" + wish.url}
                                                        
                                                        round="2px"
                                                    >
                                                        <Text size="12px" color={this.props.data.color3}>{tag}</Text>
                                                    </Box>
                                                )
                                            })}
                                        </Box>
                                    </Box>
                                </Box>
                            )
                        })}
                    </Box>
                </Box>
            </Box>
        )};

        let addWishlistItemForm = (
            <Box width="100%" height="100%" background="none" align="start" justify="center" pad="none" direction="column">
                <Box
                    width="800px"
                    height={{"min":"130px"}}
                    background={this.props.data.color2}
                    pad="medium"
                    direction="row"
                    align="center"
                    round={{"size":"4px", "corner":"top"}}
                >
                    <Text margin="small" color={this.props.data.color1} size="xxlarge">
                        Wishlist item: {this.props.data.getNameAlt(this.state.privateListLoaded ? this.state.currentMember.firstname : this.props.data.username) } 
                    </Text>
                </Box>
                {this.state.error !== "" && 
                    <Box
                        width="800px"
                        background="red"
                        pad="small"
                        direction="row"
                        align="center"
                    >
                        <Text margin="small" color={this.props.data.color1} size="small">{this.state.error}</Text>
                    </Box>
                }
                <Box background="white" align="start" justify="start" pad="large" round="10px" direction="column" gap="small" overflow={{"vertical":"auto"}}>
                    
                    <FormField height={{"min":"90px"}} name="title" label="Title" width="700px">
                        <TextInput  
                            placeholder='Title of this item' 
                            name="title" 
                            value={this.state.itemTitle}
                            onChange={event => {this.setState({itemTitle: event.target.value});}}
                        />
                    </FormField>
                    <FormField height={{"min":"90px"}} name="url" label="Item Link" width="700px">
                        <TextInput  
                            placeholder='URL of this item' 
                            name="url" 
                            value={this.state.itemURL}
                            onChange={event => {this.setState({itemURL: event.target.value});}}
                        />
                    </FormField>
                    <FormField height={{"min":"90px"}} name="cost" label="Maximum Cost" width="700px">
                        <TextInput  
                            placeholder='Maximum cost you are willing to pay' 
                            name="cost" 
                            value={this.state.itemMaxCost}
                            onChange={event => {this.setState({itemMaxCost: event.target.value});}}
                        />
                    </FormField>
                    <FormField height={{"min":"120px"}} name="tags" label="Item categories" width="700px">

                        <Box
                            direction="row"
                            gap="small"
                            overflow={{"vertical":"auto"}}
                            margin={{"bottom":"3px"}}
                        >
                            <ReactTags 
                                tags={this.state.itemCategories}
                                suggestions={[]}
                                handleDelete={this.handleDelete}
                                handleAddition={this.handleAddition}
                                handleDrag={this.handleDrag}
                                delimiters={delimiters} 
                            />
                        </Box>
                        
                    </FormField>
                    <Box
                        direction="row"
                        gap="small"
                        height={{"min":"90px"}}
                    >
                        <Box
                            height="30px"
                            onClick={() => this.submitWish()}
                            pad={{
                                "left":"medium",
                                "right":"medium",
                                "top":"small",
                                "bottom":"small",
                            }}
                            background="#000"
                            direction="row"
                            justify="center"
                            align="center"
                            round="50px"
                        >
                            {this.state.addingItem ? (
                                <Box direction="row" gap="small">
                                    {" "}
                                    <Spinner color="#fff" /> <Text size="small"> Adding... </Text>
                                </Box>
                            ):(<Text color="#eee" size="small">Submit</Text>)}
                            
                        </Box>
                        <Box
                            height="30px"
                            onClick={() => this.setState({addItem:false, addingItem: false})}
                            pad={{
                                "left":"medium",
                                "right":"medium",
                                "top":"small",
                                "bottom":"small",
                            }}
                            background="none"
                            direction="row"
                            justify="center"
                            align="center"
                            round="50px"
                            border={{ color: "#000", side: 'all' }}
                        >
                            <Text color="#000" size="small">Close</Text>
                        </Box>
                    </Box>
                    
                </Box>
            </Box>
        );

        let createWishlistForm = (
            <Box width="100%" height="100%" background="none" align="start" justify="center" pad="none" direction="column">
                <Box
                    width="800px"
                    height={{"min":"130px"}}
                    background={this.props.data.color2}
                    pad="medium"
                    direction="row"
                    align="center"
                    round={{"size":"4px", "corner":"top"}}
                >
                    <Text margin="small" color={this.props.data.color1} size="xxlarge">Create Wishlist</Text>
                </Box>
                {this.state.error !== "" && 
                    <Box
                        width="800px"
                        background="red"
                        pad="small"
                        direction="row"
                        align="center"
                    >
                        <Text margin="small" color={this.props.data.color1} size="small">{this.state.error}</Text>
                    </Box>
                }
                <Box background="white" align="start" justify="start" pad="large" round="10px" direction="column" gap="small" overflow={{"vertical":"auto"}}>
                    
                    <FormField height={{"min":"90px"}} name="title" label="Title" width="700px">
                        <TextInput  
                            placeholder='Title of this wishlist' 
                            name="title" 
                            value={this.state.wishlistTitle}
                            onChange={event => {this.setState({wishlistTitle: event.target.value});}}
                        />
                    </FormField>
                    <FormField height={{"min":"90px"}} name="id" label="ID" width="700px">
                        <TextInput  
                            placeholder='Create an id for this wishlist' 
                            name="id" 
                            value={this.state.wishlistId}
                            onChange={event => {this.setState({wishlistId: event.target.value});}}
                        />
                    </FormField>
                    <Box
                        direction="row"
                        gap="small"
                        height={{"min":"90px"}}
                    >
                        <Box
                            height="30px"
                            onClick={() => this.createWishlist()}
                            pad={{
                                "left":"medium",
                                "right":"medium",
                                "top":"small",
                                "bottom":"small",
                            }}
                            background="#000"
                            direction="row"
                            justify="center"
                            align="center"
                            round="50px"
                        >
                            {this.state.creatingList ? (
                                <Box direction="row" gap="small">
                                    {" "}
                                    <Spinner color="#fff" /> <Text size="small"> Creating... </Text>
                                </Box>
                            ):(<Text color="#eee" size="small">Create</Text>)}
                            
                        </Box>
                        <Box
                            height="30px"
                            onClick={() => this.setState({createList:false, creatingList: false})}
                            pad={{
                                "left":"medium",
                                "right":"medium",
                                "top":"small",
                                "bottom":"small",
                            }}
                            background="none"
                            direction="row"
                            justify="center"
                            align="center"
                            round="50px"
                            border={{ color: "#000", side: 'all' }}
                        >
                            <Text color="#000" size="small">Close</Text>
                        </Box>
                    </Box>
                    
                </Box>
            </Box>
        );

        return (
            
            <Box
                width="100vw"
                height="100vh"
            >
                {/** MODAL */}
                {(this.state.addItem || this.state.createList) && 
                    <Layer animation="fadeIn" modal={true}>
                        {/** CREATING A NEW WISH LIST ITEM */}
                        {this.state.addItem && 
                            addWishlistItemForm
                        }

                        {this.state.createList && 
                            createWishlistForm
                        }
                    </Layer>
                }
            
                <ResponsiveContext.Consumer>
                    {responsive =>
                        responsive === "small" ? (
                            <Box
                                margin="0" 
                                width="100%" 
                                height={{"min":"100%"}} 
                                direction="column" 
                                gap="small"
                                align="stretch"
                            >
                                {searchbar}
                                {content(responsive)}
                            </Box>
                        ) : (
                            <Box 
                                margin="0" 
                                width="100%" 
                                height={{"max":"100%"}} 
                                direction="row" 
                                align="start"
                                justify="between"
                                gap="50px"
                                
                                
                            >
                                {sidebar}
                                <Box
                                    width="100%" 
                                    height={{"max":"100%"}}
                                    overflow={{"vertical":"auto"}}
                                    margin="0"
                                    pad="0"
                                >
                                {content(responsive)}
                                </Box>
                                
                            </Box>
                        )
                    }
                </ResponsiveContext.Consumer>
            </Box>
        );
    }
    
}

export default withRouter(Dashboard);