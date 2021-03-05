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
    ResponsiveContext
} from 'grommet';

import { Login, Menu, Logout, Add, Close, Analytics, Chat, Clock, Configure, Help, Projects, StatusInfoSmall } from "grommet-icons";

import {Banner, BannerAlt} from 'Media';
import { RiUser4Line } from "react-icons/ri";
import { AiFillEdit, AiOutlineUsergroupAdd } from "react-icons/ai";

import {Rules} from 'Components';


class Dashboard extends Component {
    

    constructor(props) {
        super(props)
        this.state = {
            error: '',
            socket: null
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
            <Grommet theme={grommet} full background={this.props.data.color1}>
                <Box
                    direction="column"
                    pad="none"
                    background={this.props.data.color1}
                    fill
                    align="center"
                    justify="center"
                >
                 
                    {this.state.isLoggedIn ?
                        <ResponsiveContext.Consumer>
                            {responsive =>
                                responsive === "small" ? (
                                    <Box
                                        margin="small" 
                                        width="98%" 
                                        height={{"min":"96.5%"}} 
                                        direction="column" 
                                        gap="small"
                                    >
                                        
                                    </Box>
                                ) : (
                                    <Box 
                                        margin="small" 
                                        width="98%" 
                                        height="96.5%" 
                                        direction="row" 
                                        align="center"
                                        justify="between"
                                    >
                                       
                                    </Box>
                                )
                            }
                        </ResponsiveContext.Consumer>
                        
                    :
                        <Box width="80%" height="auto">
                            <Image src={Banner} fit="contain"/>
                        </Box>
                    }

                </Box>
            </Grommet>
        );
    }
    
}

export default withRouter(Dashboard);