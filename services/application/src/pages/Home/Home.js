import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Link, Route, Switch, BrowserRouter } from 'react-router-dom';

import { grommet, Grommet, Anchor, Box, Button, Header, Nav, Image, Avatar, Text } from 'grommet';

import { Login, Notes, Logout, Organization, User, StatusCritical, Refresh, CheckboxSelected } from "grommet-icons";
import "./Home.css";

import {Dashboard, NavBar} from 'Components';

class Home extends Component {

    _isMounted = false;

    constructor(props) {
        super(props)
        this.state = {
            resent: false,
            tag:''
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

    componentDidMount() {
        this._isMounted = true;
        this.setState(this.props.data);


        if (this._isMounted && !this.props.data.isLoggedIn) {
            this.props.history.push("/login");
        }
        if (this._isMounted && this.props.data.isLoggedIn && !this.props.data.verified) {
            this.props.history.push("/reset");
        }
        
    }

    resendEmail() {
        
        fetch('/api/sendVerification', {
            method: 'POST',
            body: JSON.stringify({}),
            headers: {
                'Accept': 'application/json, text/plain, */*',  // It can be used to overcome cors errors
                'Content-Type': 'application/json'
            }
        })
        .then(res => {
            if (res.status === 200) {
                this.setState({resent: true});
            }
        })
        .catch(err => {
            console.error(err);
        });
    }

    render() {

        const customTheme = {
            global: {
              colors: {
                custom: this.props.data.color1
              }
            }
        };

        return (
            <Grommet theme={customTheme}>

                {this.state.isLoggedIn ?
                    <Box
                        direction="column"
                        pad="none"
                        width="100vw"
                        height="100vh"
                        round="small"
                        direction="column"
                        gap="small"
                    >
                        <NavBar data={this.props.data}/>
                        <Box fill background='none'>
                            <Dashboard data={this.props.data}/>
                        </Box>
                    </Box>

                :
                   <Box></Box>
                }
            
                
            </Grommet>
        );
    }
    
}

export default withRouter(Home);