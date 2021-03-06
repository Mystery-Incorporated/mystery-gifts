import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Link, Route, Switch, BrowserRouter} from 'react-router-dom';
import queryString from 'query-string'

import "./Profile.css";

import {
    Grommet,
    Box, 
    Text, 
    Button, 
    Form,
    FormField,
    MaskedInput,
    TextInput,
    Layer,
    Meter,
    ResponsiveContext

} from 'grommet';
import { grommet } from "grommet/themes";

import { 
    Login, 
    Organization, 
    User, 
    CloudUpload, 
    MailOption, 
    Hide, 
    View, 
    Add, 
    FormClose, 
    StatusGood, 
    Tag, 
    Alert
} from "grommet-icons";
import { AiFillEdit,  } from "react-icons/ai";
import { RiGamepadLine } from "react-icons/ri";
import { IoMdTrophy } from "react-icons/io";
import { GiLibertyWing, GiMinigun } from "react-icons/gi";
import { FaSkull } from "react-icons/fa";

class Profile extends Component {
    _isMounted = false;

    constructor(props) {
        super(props)
        this.state = {

            password:null,
            password2:null,
            reveal: false,
            message: null,
            canEdit:false,
            edit:false,
            error:'',
        };
        
    }

    handleInputChange = (value) => {

        if (Object.keys(value).length ==  0) {
            this.setState({
                
                password:null,
                password2:null,
                reveal: false,
                message: null,
                error:''
            });
        }
        else {
            for ( var property in value ) {
                this.setState({[property]: value[property]});
            }
        }
        this.setState({
            error:''
        });
    }

    setReveal = (val) => {
        this.setState({reveal: val});
    }

    setInvalid = (val) => {
        console.log(val);
        this.setState({invalid: val});
    }

    setWorking = (working) => {
        this.setState({working:working});
    }

    setEdit = (edit) => {
        this.setState({edit: edit, error:''});
    }

    saveData = () => {
        
        console.log(this.state);
        this.setState({
            error:''
        });

        if (this.state.password != this.state.password2) {
            this.setState({message: "Password does not match."});
        }
        else {  
            fetch('/api/users/update', {
                method: 'POST',
                body: JSON.stringify({
                    username:this.state.username,
                    password:this.state.password
                }),
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
                    this.setState({error: data.msg});
                }
                else {
                    this.setState({edit: false, username:data.username});
                    console.log(this.state);
                }
            }) 
            .catch(err => {
                alert('Error logging in please try again');
            });
            
        }
    }

    onSubmit = (event) => {
        event.preventDefault();
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    componentDidMount() {
        this._isMounted = true;

        if (this._isMounted) {
            const values = queryString.parse(this.props.location.search)
            var user = values.user ;

            if (!user) {
                user = this.props.data.username;
                this.setState({canEdit: true});
            }

            if (user) {
                fetch('/api/users/' + user, {
                    headers: {
                        'Accept': 'application/json, text/plain, */*',  // It can be used to overcome cors errors
                        'Content-Type': 'application/json'
                    }
                })
                .then(res => {
                    return res.json();
                })
                .then(data => {
                    if (data) {
                        if ('error' in data) {
                            if (this._isMounted) {
                                this.setState({error: data.msg});
                            }
                        }
                        else {
                            if (this._isMounted) {
                                this.setState({
                                    data: data.data,
                                    username: this.props.data.username
                                });
                            }
                        }
                    }
                }) 
                .catch(err => {
                    console.error(err);
                });
            }
        }
    }
    

    render() {
        var value = this.state;
        
        const onOpen = () => this.setInvalid(true);
        const onClose = () => this.setInvalid(undefined);

        return (
            <Box>Test</Box>
        );
    }
    
}

export default withRouter(Profile);