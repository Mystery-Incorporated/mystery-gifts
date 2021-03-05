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
            <ResponsiveContext.Consumer>
                {responsive =>
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
                                margin={{"left":"10px"}}
                            >

                                <Text size={responsive === "small" ? "small" : "large"}>
                                    It is the {<Text size={responsive === "small" ? "small" : "large"} color={this.props.data.color2}>{this.props.data.formatHumanDate(new Date())}</Text>}.
                                </Text>
                                
                            </Box>
                            <Nav 
                                direction="row"
                                gap="small"   
                                margin={{"right":"15px"}} 
                            >
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
                                        size={responsive === "small" ? "30px" : "35px"} 
                                        round={true}
                                    />
                                    <Text size="small" color={this.props.data.color3}>
                                        {this.props.data.getName()}
                                    </Text>
                                </Box>

                                <Menu
                                    children={(props) =>
                                        <Box pad="xsmall" className="hover-button" direction="row" justify="center" align="start" round="50px">
                                            <Notification size={responsive === "small" ? "15px" : "20px"}/>
                                            {this.state.newNotifs > 0 && <Box width="8px" height="8px" background="red" round="100%"></Box>}
                                        </Box>
                                    }
                                    plain
                                    size="large"
                                    dropProps={{ align: { top: 'bottom', left: 'left' } }}
                                    items={[]}
                                />

                                <Box 
                                    direction="row" 
                                    align="center" 
                                    gap="small"
                                    pad="0"
                                    round="50px"
                                    onClick={() => {this.props.history.push("/logout")}}
                                >
                                    <Box pad="xsmall" className="hover-button" direction="row" justify="center" align="center" round="50px" className="hover-button">
                                        <Logout color={this.props.data.color3} size={responsive === "small" ? "15px" : "20px"} />
                                    </Box>
                                </Box>
                                
                                
                            </Nav>
                        </Box>

                    </Box>
                }
            </ResponsiveContext.Consumer>
        );
    }
    
}

export default withRouter(NavBar);