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
            tag:'',
            id:null,
            pid:null
        };

        this.getListIds = this.getListIds.bind(this);
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

    getListIds() {
        this.setState({id: this.props.match.params.id, pid: this.props.match.params.pid});
    }

    componentDidMount() {
        this._isMounted = true;
        this.setState(this.props.data);
        this.getListIds()

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
              },
              focus: {
                  border: {
                      color: "none"
                  }
              }
              
            }
        };

        let data = this.props.data;
        data.id = this.state.id;
        data.pid = this.state.pid;
        data.getListIds = this.getListIds;


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
                        <NavBar data={data}/>
                        <Box fill background='none'>
                            <Dashboard data={data}/>
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