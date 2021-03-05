import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Link, Route, Switch, BrowserRouter } from 'react-router-dom';

import "./NavBar.css";

import { 
    grommet, 
    Grommet, 
    Text, 
    Box, 
    Button, 
    TextInput, 
    Image, 
    ResponsiveContext,
    Anchor,
    Nav,
    Menu
} from 'grommet';

import { Login, Notes, Logout, Organization, User, StatusCritical, Refresh, CheckboxSelected, Configure, FormDown, Notification } from "grommet-icons";

import {Banner, BannerAlt} from 'Media';
import { RiUser4Line } from "react-icons/ri";
import { AiFillEdit, AiOutlineUsergroupAdd } from "react-icons/ai";

import Avatar from 'react-avatar';

import {} from 'Components';


class NavBar extends Component {
    

    constructor(props) {
        super(props)
        this.state = {
            error: '',
            socket: null,
            newNotifs: 0
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

    componentDidMount() {
        this.setState(this.props.data);
    }
    

    render() {        

        return (
            <Box
                direction="column"
                pad="none"
                margin="none"
                background={this.props.data.color2}
                width="100%"
                height="75px"
                align="center"
                justify="center"
                background="none"
            >
                
                <Box width="100%" direction="row" align="center" justify="between" background="none" pad="small">
                            
                    <Box 
                        direction="row" 
                        align="center" 
                        gap="small"
                        className="hover-button"
                        pad={{
                            "top":"xsmall",
                            "bottom": "xsmall",
                            "left":"small",
                            "right":"small"
                        }}
                        round="50px"
                        onClick={() => {console.log("GOTO PROFILE")}}
                    >
                        <Avatar 
                            name={this.props.data.getFullName()}
                            src={this.props.data.avatar} 
                            size="40px" 
                            round={true}
                        />
                        <Text color={this.props.data.color3}>
                            {this.props.data.getName()}
                        </Text>
                    </Box>
                    <Nav direction="row">

                        <Menu
                            children={(props) =>
                                <Box pad="small" className="hover-button" direction="row" justify="center" align="start" round="50px">
                                    <Notification />
                                    {this.state.newNotifs > 0 && <Box width="8px" height="8px" background="red" round="100%"></Box>}
                                </Box>
                            }
                            plain
                            size="large"
                            dropProps={{ align: { top: 'bottom', left: 'left' } }}
                            items={[]}
                        />
                        
                        <Menu
                            children={(props) => <Box pad="small" className="hover-button" round="50px"><FormDown /></Box>}
                            plain
                            dropProps={{ align: { top: 'bottom', left: 'left' } }}
                            items={[
                                {
                                    label: 
                                        <Box
                                            alignSelf="center"
                                            direction="column"
                                            align="start"
                                            justify="center"
                                            pad={{"left":"medium", "right":"medium"}}
                                        >
                                            <Text color={this.props.data.color3}>
                                                {this.props.data.getFullName()}
                                            </Text>
                                            <Text
                                                color={this.props.data.color2}
                                                size="xsmall"
                                            >
                                                See your profile
                                            </Text>
                                        </Box>
                                    ,
                                    href: "/user/" + this.props.data.username,
                                    icon: 
                                        <Avatar 
                                            name={this.props.data.getFullName()}
                                            src={this.props.data.avatar} 
                                            size="40" 
                                            round={true}
                                        />
                                    ,
                                },
                                {
                                    label: 
                                        <Box
                                            alignSelf="center"
                                            direction="column"
                                            align="start"
                                            justify="center"
                                            pad={{"left":"medium", "right":"medium"}}
                                        >
                                            <Text color={this.props.data.color3}>
                                                Settings
                                            </Text>
                                        </Box>
                                    ,
                                    onClick: () => {},
                                    icon: (
                                        <Configure color={this.props.data.color3} size='20px' />
                                    ),
                                },
                                {
                                    label: 
                                        <Box
                                            alignSelf="center"
                                            direction="column"
                                            align="start"
                                            justify="center"
                                            pad={{"left":"medium", "right":"medium"}}
                                        >
                                            <Text color={this.props.data.color3}>
                                                Logout
                                            </Text>
                                        </Box>
                                    ,
                                    href: "/logout",
                                    icon: (
                                        <Logout color={this.props.data.color3} size='20px' />
                                    ),
                                },
                            ]}
                        />
                    </Nav>
                </Box>

            </Box>
        );
    }
    
}

export default withRouter(NavBar);