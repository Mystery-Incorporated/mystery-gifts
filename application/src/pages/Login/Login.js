import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import "./Login.css";

import {
    Box,
    Button,
    CheckBox,
    Grommet,
    Form,
    FormField,
    MaskedInput,
    RadioButtonGroup,
    RangeInput,
    Select,
    TextArea,
    TextInput,
    Text,
    Layer,
    ResponsiveContext
} from "grommet";

import { grommet } from "grommet/themes";
import { MailOption, Hide, View, Add, FormClose, StatusGood, Alert  } from 'grommet-icons';

import {Spinner} from 'Components';

class Login extends Component {

    constructor(props) {
        super(props)
        this.state = {
            email:'',
            password:'',
            invalid: false,
            reveal: false,
            error:'',
            working:false
        };
    }

    handleInputChange = (value) => {
        if (Object.keys(value).length ==  0) {
            this.setState({
                email:'',
                password:'',
                invalid: false,
                reveal: false,
                error:'',
                working:false
            });
        }
        else {
            for ( let property in value ) {
                this.setState({[property]: value[property]});
            }
        }
        this.setState({
            error:''
        });
    }
    
    setInvalid = (val) => {
        console.log(val);
        this.setState({invalid: val});
    }

    setWorking = (working) => {
        this.setState({working:working});
    }

    submit = () => {
        this.setState({
            error:''
        });
        this.setWorking(true);
        fetch('/api/signin', {
            method: 'POST',
            body: JSON.stringify(this.state),
            headers: {
                'Accept': 'application/json, text/plain, */*',  // It can be used to overcome cors errors
                'Content-Type': 'application/json'
            }
        })
        .then(res => {
            this.setWorking(false);
            return res.json();
        })
        .then(data => {
            if ('error' in data) {
                this.setState({error: data.msg});
            }
            else {
                console.log(data);
                this.props.data.login(data);
                this.props.history.push('/');
            }
        }) 
        .catch(err => {
            alert('Error logging in please try again');
        });

        
    }

    setReveal = (val) => {
        this.setState({reveal: val});
    }

    componentDidMount() {
        fetch('/api/checkToken', {
            headers: {
                'Accept': 'application/json, text/plain, */*',  // It can be used to overcome cors errors
                'Content-Type': 'application/json'
            }
        })
        .then(res => {
            console.log(res.status);
            if (res.status === 200) {
                this.props.history.push('/');
            } 
        }) 
        .catch(err => {
            console.error(err);
        });
    }

    render() {
        let value = this.state;

        const emailMask = [
            {
                regexp: /^[\w\-_.]+$/,
                placeholder: 'example',
            },
            { fixed: '@' },
            {
                regexp: /^[\w]+$/,
                placeholder: 'my',
            },
            { fixed: '.' },
            {
                regexp: /^[\w]+$/,
                placeholder: 'com',
            },
        ];

        const onOpen = () => this.setInvalid(true);
        const onClose = () => this.setInvalid(undefined);

        let form = 
            <Box 
                direction="column"
                pad="none"
                width="100%"
                min-height="100%"
                background={this.props.data.color1}
                overflow="auto"
                round="xsmall"
            >
                <Box width="100%" background={this.props.data.color2} pad="large"> 
                    <Text color={this.props.data.color1} size="xxlarge">Sign In</Text>
                </Box>
                {this.state.error != '' && 
                <Box width="100%" background={this.props.data.color3} pad="small" direction="row" align="center"> 
                    <Alert color={this.props.data.color1} />
                    <Text margin="small" color={this.props.data.color1} size="medium">{this.state.error}</Text>
                </Box>}
                <Box pad="large">
                    <Form
                        value={value}
                        onChange={nextValue => this.handleInputChange(nextValue)}
                        onReset={() => this.handleInputChange({})}
                        onSubmit={({ value }) => {this.submit()}}
                    >
                        <FormField name="email" label="Email">
                            <MaskedInput
                                icon={<MailOption />}
                                mask={emailMask}
                                name="email"
                            />
                        </FormField>
                        <FormField name="password" label="Password">
                            <Box
                                direction="row"
                                align="center"
                                round="small"
                            >
                                <TextInput
                                    plain
                                    type={this.state.reveal ? "text" : "password"}
                                    name="password"
                                />
                                <Button
                                    icon={this.state.reveal ? <View size="medium" /> : <Hide size="medium" />}
                                    onClick={() => this.setReveal(!this.state.reveal)}
                                />
                            </Box>
                        </FormField>
                        {this.state.invalid && (
                            <Layer
                                position="bottom"
                                modal={false}
                                margin={{ vertical: "medium", horizontal: "small" }}
                                onEsc={onClose}
                                responsive={false}
                                plain
                            >
                                <Box
                                align="center"
                                direction="row"
                                gap="small"
                                justify="between"
                                round="medium"
                                elevation="medium"
                                pad={{ vertical: "xsmall", horizontal: "small" }}
                                background="status-critical"
                                >
                                <Box align="center" direction="row" gap="xsmall">
                                    <StatusGood />
                                    <Text size="small">Fill out all fields!</Text>
                                </Box>
                                <Button icon={<FormClose />} onClick={onClose} plain />
                                </Box>
                            </Layer>
                        )}
                        <Box direction="row" gap="medium" margin={{"top":"40px"}}>
                            <Button 
                                type="submit"
                                primary 
                                label={this.state.working ? (
                                    <Box direction="row" gap="small">
                                        {" "}
                                        <Spinner color="#fff" /> <Text size="medium"> Logging in... </Text>
                                    </Box>
                                ):("Login")} 
                                color={"#000"}
                            />
                            <Button label="Cancel" color={this.props.data.color3} onClick={() => this.props.history.push("/")}/>
                        </Box>
                    </Form>
                </Box>
            </Box>;


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
                    <ResponsiveContext.Consumer>
                        {responsive => responsive === "small" ? (
                            <Box 
                                direction="column"
                                pad="none"
                                width="90%"
                                min-height="90%"
                                background={this.props.data.color1}
                                overflow="auto"
                                round="xsmall"
                                elevation="small"
                            >
                                {form}
                            </Box>
                        ) : (
                            <Box 
                                direction="column"
                                pad="none"
                                width="50%"
                                min-height="70%"
                                background={this.props.data.color1}
                                overflow="auto"
                                round="xsmall"
                                elevation="small"
                            >
                                {form}
                            </Box>
                        )}
                    </ResponsiveContext.Consumer>
                    
                </Box>
            </Grommet>
        );
    }
    
}

export default withRouter(Login);