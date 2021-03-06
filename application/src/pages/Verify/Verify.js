import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Link, Route, Switch, BrowserRouter} from 'react-router-dom';
import queryString from 'query-string'

import "./Verify.css";

import { Grommet, Box, Text, Button} from 'grommet';
import { grommet } from "grommet/themes";

import { Login} from "grommet-icons";

class Verify extends Component {
    _isMounted = false;

    constructor(props) {
        super(props)
        this.state = {
            msg: ''
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
        if (this._isMounted) {
            const values = queryString.parse(this.props.location.search)
            var token = values.token;

            if (!token || token === '') {
                this.setState({msg:"Invalid Token!"});
            }
            else {
                fetch('/api/verifyEmail/' + token, {
                    method: 'POST',
                    body: JSON.stringify({}),
                    headers: {
                        'Accept': 'application/json, text/plain, */*',  // It can be used to overcome cors errors
                        'Content-Type': 'application/json'
                    }
                })
                .then(res => {
                    return res.json();
                })
                .then(data => {
                    this.setState({msg: data.msg});
                }) 
                .catch(err => {
                    console.log(err);
                    alert('Error logging in please try again');
                });
            }
        }
    }
    

    render() {

        const grey = "#474442";
        const offWhite = "#fde0bc";
        const orange = "#f2664a";

        return (
            <Grommet>
                <Box  
                    width="100vw" 
                    min-height="100vh" 
                    direction="row" 
                    align="center" 
                    justify="center" 
                    margin={{"top":"100px", "bottom":"100px"}}
                >
                    <Box 
                        direction="column"
                        pad="none"
                        width="60%"
                        min-height="70%"
                        background={offWhite}
                        overflow="auto"
                        round="xsmall"
                    >
                        <Box width="100%" background={grey} pad="large"> 
                            <Text color={offWhite} size="xxlarge">Account Verification: {this.props.data.username}</Text>
                        </Box>
                        
                        <Box pad="large">
                            {this.state.msg}
                        </Box>

                        <Box direction="row" gap="medium" margin="large">
                            <Button primary label="Home" color={orange} onClick={() => this.props.history.push("/")}/>
                        </Box>
                    </Box>
                </Box>
            </Grommet>
        );
    }
    
}

export default withRouter(Verify);