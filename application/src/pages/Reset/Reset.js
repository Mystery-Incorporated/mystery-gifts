import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import "./Reset.css";

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
    DateInput,
    Text,
    Layer,
    ResponsiveContext
} from "grommet";
import { grommet } from "grommet/themes";
import { MailOption, Hide, View, Add, FormClose, StatusGood, Tag, Alert, User  } from 'grommet-icons';

import {Spinner} from 'Components';

class Reset extends Component {

    constructor(props) {
        super(props);
        this.state = {
            currentpassword:'',
            password:'',
            password2:'',
            reveal: false,
            message: '',
            invalid: false,
            working:false,
            error:''
        };
    }

    handleInputChange = (value) => {

        if (Object.keys(value).length ==  0) {
            this.setState({
                currentpassword:'',
                password:'',
                password2:'',
                reveal: false,
                message: '',
                invalid: false,
                working:false,
                error:''
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

    setReveal = (val) => {
        this.setState({reveal: val});
    }

    setInvalid = (val) => {
        this.setState({invalid: val});
    }

    setWorking = (working) => {
        this.setState({working:working});
    }

    submit = () => {
        this.setState({
            error:''
        });

        if (this.state.password != this.state.password2) {
            this.setState({message: "Password does not match."});
        }
        else {
            this.setState({message: null});
            let ncount = 0;
            for (let prop in this.state) {
                if (this.state[prop] == null) {
                    ncount++;
                }
            }
            
            if (ncount > 1) {
                this.setInvalid(true);
            }
            else {
                this.setWorking(true);
                console.log("STATE: ", this.state);
                fetch('/api/reset', {
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
                    console.log("RESET DATA ", data);
                    if ('error' in data) {
                        this.setState({error: data.msg});
                    }
                    else {
                        console.log("!getting here");
                        this.props.data.reload();
                        this.props.data.verify();
                        this.props.history.push('/');
                    }
                }) 
                .catch(err => {
                    console.error(err);
                });
            }
        }
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
            if (res.status !== 200) {
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

        

        let regFormCont = 
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
                    <Text color={this.props.data.color1} size="xxlarge">Change Password</Text>
                </Box>
                {this.state.error != '' && 
                <Box width="100%" background={this.props.data.color2} pad="small" direction="row" align="center"> 
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

                        <FormField name="currentpassword" label="Current Password">
                            <Box
                                direction="row"
                                align="center"
                                round="small"
                            >
                                <TextInput
                                    plain
                                    type={this.state.reveal ? "text" : "password"}
                                    name="currentpassword"
                                />
                                <Button
                                    icon={this.state.reveal ? <View size="medium" /> : <Hide size="medium" />}
                                    onClick={() => this.setReveal(!this.state.reveal)}
                                />
                            </Box>
                        </FormField>

                        <FormField name="password" label="New Password">
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

                        <FormField name="password2" label="Confirm Password">
                            <Box
                                direction="row"
                                align="center"
                                round="small"
                            >
                                <TextInput
                                    plain
                                    type={this.state.reveal ? "text" : "password"}
                                    name="password2"
                                />
                                <Button
                                    icon={this.state.reveal ? <View size="medium" /> : <Hide size="medium" />}
                                    onClick={() => this.setReveal(!this.state.reveal)}
                                />
                            </Box>
                        </FormField>

                        {this.state.message && (
                            <Box pad={{ horizontal: "small" }}>
                                <Text color="status-error">{this.state.message}</Text>
                            </Box>
                        )}

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
                                        <Spinner color="#fff" /> <Text size="medium"> Working ... </Text>
                                    </Box>
                                ):("Submit")} 
                                color={"#000"}
                            />
                            <Button label="Cancel" color={this.props.data.color2} onClick={() => this.props.history.push("/")}/>
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
                    margin={{"top":"50px", "bottom":"100px"}}
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
                                {regFormCont}
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
                                {regFormCont}
                            </Box>
                        )}
                        
                        
                    </ResponsiveContext.Consumer>
                </Box>
            </Grommet>
        );
      }
    
}

export default withRouter(Reset);