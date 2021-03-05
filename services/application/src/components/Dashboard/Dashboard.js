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
import { RiUser4Line } from "react-icons/ri";
import { AiFillEdit, AiOutlineUsergroupAdd } from "react-icons/ai";

import {Rules} from 'Components';

import ContentLoader from 'react-content-loader';
import Avatar from 'react-avatar';
import {Spinner} from 'Components';

import { WithContext as ReactTags } from 'react-tag-input';
import { size } from 'polished';

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
            itemMaxCost: 0,
            myWishList: true,
            currentMember: null
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
            console.log("MEMBERS DATA ", data)
            if ('error' in data) {
                this.setState({error: data.msg});
            }
            else {
                var myData = {
                    firstname: this.props.data.firstname,
                    lastname: this.props.data.lastname,
                    dob: this.props.data.dob,
                    avatar: this.props.data.avatar,
                    email: '',
                    myData: true
                };
                data.members.unshift(myData);
                this.setState({members:data.members, currentMember: myData})
            }
        }) 
        .catch(err => {
            console.log('Error logging in please try again', err);
            alert('Error logging in please try again');
        });

    }

    loadWishList() {
        this.setState({loadingWishlist: false, wishlist: this.props.data.wishlist});
    }

    componentDidMount() {
        this._isMounted = true;

        if (this._isMounted) {
            this.loadMembers();
            this.loadWishList();
        }
    }    

    selectMember(email, member) {
        this.setState({selectingMember: true, currentMember: member});
        fetch('/api/wish/' + email, {
            method: 'GET',
            headers: {
                'Accept': 'application/json, text/plain, */*',  // It can be used to overcome cors errors
                'Content-Type': 'application/json'
            }
        })
        .then(res => {
            this.setState({selectingMember: false});
            return res.json();
        })
        .then(data => {
            console.log("MEMBERS DATA ", data)
            if ('error' in data) {
                this.setState({error: data.msg});
            }
            else {
                this.setState({wishlist:data.wishlist})
            }
        }) 
        .catch(err => {
            console.log('Error selecting member', err);
            alert('Error selecting memeber please try again');
        });
    }

    updateSuggestions(value) {
        this.setState({searchValue: value});

        const inputValue = value.trim().toLowerCase();
        const inputLength = inputValue.length;

        var filtered = inputLength === 0 ? [] : this.state.members.filter(member =>
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
        console.log("WISH", this.state)

        if (!this.isNumeric(this.state.itemMaxCost)) {
            this.setState({error:"Max Cost must be a valid price."})
        }

        if (this.state.itemTitle === "" || this.state.itemURL === "" || this.state.itemMaxCost === "") {
            this.setState({error:"Fill out all fields."})
        }

        var maxCost = parseFloat(this.state.itemMaxCost);
        var tags = this.state.itemCategories.map(function(item) {
            return item['text'];
        });
        var wish = {
            title: this.state.itemTitle,
            url: this.state.itemURL,
            maxCost: maxCost,
            tags: tags
        };

        this.setState({addingItem: false, itemCategories:[], itemMaxCost:"", itemTitle:"", itemURL:""});
        this.addToMyList(wish);
    }

    deleteWish(wish) {
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
        }) 
        .catch(err => {
            console.log("Error adding wish, ", err);
            alert('Error adding wish to list');
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
            this.props.data.reloadWishlist();
        }) 
        .catch(err => {
            console.log("Error adding wish, ", err);
            alert('Error adding wish to list');
        });
    }

    render() {    
        
        var searchbar = 
        <Box
            width="98%"
            border={{ color: "#ddd", side: 'bottom' }}

        >
            <TextInput
                icon={<Search color={this.props.data.color4} size="20px"/>}
                placeholder="Search for a member"
                plain
                value={this.state.searchValue}
                onChange={event => {this.updateSuggestions(event.target.value);}}
                onFocus={() => this.setState({showSuggestions:true})}
                onBlur={() => setTimeout(() => {this.setState({showSuggestions:false})},50)}
                size="small"
            />
            {this.state.showSuggestions &&
                <Box
                    width="100%"
                    height={{"max":"400px"}}
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
                                    this.selectMember(member.email, member);
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
        </Box>;

        var sidebar = 
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
                    <AvatarWithText />
                    <AvatarWithText />
                    <AvatarWithText />
                    <AvatarWithText />
                    <AvatarWithText />
                </Box>
            :
                <Box
                    width="100%"
                    height="100%"
                    gap="xsmall"
                >
                    {this.state.members.map(member => {
                        return (
                            <Box
                                width="100%"
                                height="70px"
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
                                    this.selectMember(member.email, member);
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

        var content = (responsive) => {
        return (
            <Box
                direction="column"
                justify="start"
                flex="grow"
                pad="small"
            >
                <Box
                    width="100%"
                    height="100%"
                    direction={responsive === "small" ? "column-reverse":"column"}
                    gap="medium"
                >
                    <Box
                        width="100%"
                        direction={responsive === "small" ? "row-reverse":"row"}
                        pad="small"
                        gap="large"
                        align="center"
                    >
                        <Box
                            height="30px"
                            onClick={() => this.setState({addItem:true})}
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
                            <Text color="#eee" size="small">Add item</Text>
                        </Box>
                        {this.state.currentMember && 
                            <Box
                                height="30px"
                                direction="row"
                                justify="center"
                                align="center"
                                gap="small"
                            >
                                <Text color={this.props.data.color2} size="xlarge">{this.props.data.getNameAlt(this.state.currentMember.firstname)}'s</Text>
                                <Text color={this.props.data.color3} size="xlarge">list</Text>
                            </Box>
                        }
                    </Box>
                    <Box
                        width="100%"
                        height="100%"
                        overflow={{"vertical":"auto"}}
                        pad={{"left":"5px"}}
                    >
                        {(!this.state.wishlist || this.state.wishlist.length == 0) && 
                            <Text color={this.props.data.color4} size="xlarge" >There is nothing in this wish list.</Text>
                        }

                        {this.state.wishlist.map((wish, i) => {
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
                                            >
                                                <Text size="12px">Copy link</Text>
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
                                                        background="#e0dbc3"
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

        return (
            
            <Box
                width="100vw"
                height="100vh"
            >
                {this.state.addItem && 
                    <Layer animation="fadeIn" modal={true}>
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
                                <Text margin="small" color={this.props.data.color1} size="xxlarge">Wish list item</Text>
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
                                        onChange={event => {this.setState({itemTitle: event.target.value});}}
                                    />
                                </FormField>
                                <FormField height={{"min":"90px"}} name="url" label="Item Link" width="700px">
                                    <TextInput  
                                        placeholder='URL of this item' 
                                        name="url" 
                                        onChange={event => {this.setState({itemURL: event.target.value});}}
                                    />
                                </FormField>
                                <FormField height={{"min":"90px"}} name="cost" label="Maximum Cost" width="700px">
                                    <TextInput  
                                        placeholder='Max cost limit for this item' 
                                        name="cost" 
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
                                        onClick={() => this.setState({addItem:false})}
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
                                height="100%" 
                                direction="row" 
                                align="start"
                                justify="between"
                                gap="50px"
                                
                            >
                                {sidebar}
                                {content(responsive)}
                            </Box>
                        )
                    }
                </ResponsiveContext.Consumer>
            </Box>
        );
    }
    
}

export default withRouter(Dashboard);