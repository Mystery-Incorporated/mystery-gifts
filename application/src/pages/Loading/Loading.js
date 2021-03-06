import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import "./Loading.css";

import { Grommet, Box, Text, Button, WorldMap} from 'grommet';
import { grommet } from "grommet/themes";

import { Login } from "grommet-icons"

class Loading extends Component {

    constructor(props) {
        super(props)
        this.state = {
            x : null,
            y: null
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
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(this.showPosition);
        } else { 
            //x.innerHTML = "Geolocation is not supported by this browser.";
        }
    }

    showPosition = (position) => {
        this.setState({x:position.coords.latitude, y:position.coords.longitude})
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
                        width="100%"
                        min-height="100%"
                        background="none"
                        overflow="auto"
                        align="center" 
                        justify="center" 
                        round="xsmall"
                        pad="xlarge"
                    >
                        <WorldMap
                            alignSelf="center"
                            color={offWhite}
                            onSelectPlace={(lat, lon) => {}}
                            places={[
                                {
                                    name: 'Sydney',
                                    location: this.state.x != null ? [this.state.x, this.state.y]: [],
                                    color: orange,
                                    onClick: (name) => {},
                                },
                            ]}
                            selectColor={orange}
                        />
                    </Box>
                </Box>
            </Grommet>
        );
    }
    
}

export default withRouter(Loading);