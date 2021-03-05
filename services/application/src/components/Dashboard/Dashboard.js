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
    Layer
} from 'grommet';

import { Login, Menu, Logout, Add, Close, Analytics, Chat, Clock, Configure, Help, Projects, StatusInfoSmall, Search } from "grommet-icons";

import {Banner, BannerAlt} from 'Media';
import { RiUser4Line } from "react-icons/ri";
import { AiFillEdit, AiOutlineUsergroupAdd } from "react-icons/ai";

import {Rules} from 'Components';

import ContentLoader from 'react-content-loader';
import Avatar from 'react-avatar';

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
            error:'',
            addItem:false
        };
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
                this.setState({members:data.members})
            }
        }) 
        .catch(err => {
            console.log('Error logging in please try again', err);
            alert('Error logging in please try again');
        });

    }

    loadWishList() {
        this.setState({loadingWishlist: false});
    }

    componentDidMount() {
        this._isMounted = true;

        if (this._isMounted) {
            this.loadMembers();
            this.loadWishList();
        }
    }    

    selectMember(member) {
        console.log("SELECTED MEMBER", member)
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
                                onClick={() => this.selectMember(member)}
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
                                onClick={() => this.selectMember(member)}
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

        var content = 
        <Box
            direction="column"
            justify="start"
            flex="grow"
            pad="small"
        >
            <ResponsiveContext.Consumer>
                {responsive =>
                    <Box
                        width="100%"
                        height="100%"
                        flex="grow"
                        direction={responsive === "small" ? "column-reverse":"column"}
                        gap="medium"
                    >
                        <Box
                            width="100%"
                            direction={responsive === "small" ? "row-reverse":"row"}
                            pad="small"
                        >
                            <Box
                                height="30px"
                                onClick={() => this.setState({addItem:true})}
                                pad="medium"
                                background="#000"
                                direction="row"
                                justify="center"
                                align="center"
                                round="50px"
                            >
                                <Text color="#eee" size="small">Add item</Text>
                            </Box>
                        </Box>
                        <Box
                            width="100%"
                            height="100%"
                            overflow={{"vertical":"auto"}}
                            pad={{"left":"5px"}}
                        >
                            {(!this.props.data.wishlist || this.props.data.wishlist.length == 0) && 
                                <Text color={this.props.data.color4} size="xlarge" >There is nothing in your wish list.</Text>
                            }
                        </Box>

                    </Box>
                }
            </ResponsiveContext.Consumer>
        
        </Box>

        return (
            
            <Box
                width="100vw"
                height="100vh"
            >
                {this.state.addItem && 
                    <Layer animation="fadeIn" modal={true}>
                        <Box width="100%" height="100%" background={this.props.data.color3} align="center" justify="center" pad="none" >
                            <Box background="white" align="center" justify="center" pad="large">
                                <Box
                                    height="30px"
                                    onClick={() => this.setState({addItem:false})}
                                    pad="medium"
                                    background="#000"
                                    direction="row"
                                    justify="center"
                                    align="center"
                                    round="50px"
                                >
                                    <Text color="#eee" size="small">Close</Text>
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
                                align="center"
                            >
                                {searchbar}
                                {content}
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
                                {content}
                            </Box>
                        )
                    }
                </ResponsiveContext.Consumer>
            </Box>
        );
    }
    
}

export default withRouter(Dashboard);