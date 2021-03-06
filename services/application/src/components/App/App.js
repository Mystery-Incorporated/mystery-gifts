import React, { Component } from 'react';
import './App.css';

import { Link, Route, Switch, BrowserRouter } from 'react-router-dom';
import { Box, Heading, Grommet } from 'grommet';

import { Home, Login, Logout, Reset, Loading, Verify, Profile } from 'Pages';

import { ToastContainer } from "react-toast";

class App extends Component {
    _isMounted = false;

    constructor(props) {
        super(props);
        this.state = {
            mag:'',
            loading:true,
            isLoggedIn:false,
            verified:false,
            firstname: '',
            lastname: '',
            avatar: '',
            dob:'',
            wishlist: [],
            username: ''
        };

        this.logout = this.logout.bind(this);
        this.login = this.login.bind(this);
        this.getName = this.getName.bind(this);
        this.getNameAlt = this.getNameAlt.bind(this);
        this.getFullName = this.getFullName.bind(this);
        this.formatDOB = this.formatDOB.bind(this);
        this.formatDate = this.formatDate.bind(this);
        this.formatDateTime = this.formatDateTime.bind(this);
        this.formatHumanDate = this.formatHumanDate.bind(this);
        this.getRemainingDays = this.getRemainingDays.bind(this);
        this.reloadWishlist = this.reloadWishlist.bind(this);
        this.reload = this.reload.bind(this);
        this.verify = this.verify.bind(this);
    }

    login(data) {
        this.setState({isLoggedIn: true, firstname:data.firstname, lastname:data.lastname, verified:data.verified, avatar: data.avatar, username: data.username, wishlist:data.wishlist, dob:data.dob});
    }

    logout() {
        this.setState({
            mag:'',
            isLoggedIn:false,
            verified:false,
            firstname: '',
            lastname: '',
            avatar: '',
            dob:'',
            wishlist: [],
            username: ''
        });

    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    componentDidMount() {
        this._isMounted = true;

        if (this._isMounted) this.reload()
        
    }

    verify() {

        this.setState({verified: true});
        
    }

    reload() {
        fetch('/api/checkToken', {
            headers: {
                'Accept': 'application/json, text/plain, */*',  // It can be used to overcome cors errors
                'Content-Type': 'application/json'
            }
        })
        .then(res => {
            if (res.status === 200) {
                return res.json();
            } else {
                if (this._isMounted) {
                    this.setState({
                        msg: "PLEASE LOGIN FIRST.",
                        isLoggedIn:false,
                        loading:false
                    });
                }
            }
        })
        .then(data => {
            if (data) {
                if (this._isMounted) {
                    this.setState({
                        firstname: data.firstname,
                        lastname: data.lastname,
                        username: data.username,
                        avatar: data.avatar,
                        wishlist: data.wishlist,
                        dob:data.dob,
                        msg: "USER LOGGED IN!",
                        isLoggedIn:true,
                        loading:false,
                        verified: data.verified
                    });
                    console.log("RELOADING: ", data);
                }
            }
            
        }) 
        .catch(err => {
            console.error(err);
            alert('Error checking token');
        });
    }

    reloadWishlist() {
        fetch('/api/wish', {
            headers: {
                'Accept': 'application/json, text/plain, */*',  // It can be used to overcome cors errors
                'Content-Type': 'application/json'
            }
        })
        .then(res => {
            if (res.status === 200) {
                return res.json();
            }
        })
        .then(data => {
            console.log("RELOADING WISHES, ", data);
            if (data) {
                this.setState({wishlist: data.wishlist});
            }
            
        }) 
        .catch(err => {
            console.error(err);
            alert('Error checking token');
        });
        
    }

    formatDOB(dob) {
        if (dob) {
            var date = Date.parse(dob);
            var options = { month: 'long', day: 'numeric' };
            return new Intl.DateTimeFormat('en-US', options).format(date);
        }
    }

    formatDate(date) {
        if (date) {
            var date = Date.parse(date);
            var options = { };
            return new Intl.DateTimeFormat('en-US', options).format(date);
        }
    }

    formatDateTime(date) {
        if (date) {
            var date = Date.parse(date);
            var options = { dateStyle: 'medium', timeStyle: 'short' };
            return new Intl.DateTimeFormat('en-US', options).format(date);
        }
    }

    formatHumanDate(d) {
        if (d) {
            var date = Date.parse(d);
            var options = { month: 'long', day: 'numeric' };
            var dateSplit =  new Intl.DateTimeFormat('en-US', options).format(date).split(" ");

            return dateSplit[1] + this.nth(dateSplit[1]) + " of " + dateSplit[0];
        }
    }

    getName() {
        return this.getNameAlt(this.state.firstname);
    }

    getNameAlt(name) {
        var name = name.toLowerCase().split(' ');
        for (var i = 0; i < name.length; i++) {

            name[i] = name[i].charAt(0).toUpperCase() + name[i].substring(1);     
        }

        return name.join(' ');
    }

    getFullName() {
        return this.getNameAlt(this.state.firstname) + " " + this.getNameAlt(this.state.lastname);
    }

    getRemainingDays(dob) {

        if (dob) {
            var birthday = new Date(dob);
            var today = new Date();

                birthday.setFullYear(today.getFullYear());
            if (today > birthday) {
                birthday.setFullYear(today.getFullYear() + 1);
            }

            return Math.floor((birthday - today) / (1000*60*60*24))
        }
        else {
            return 0;
        }
    }

    nth(d) {
        if (d > 3 && d < 21) return 'th';
        switch (d % 10) {
            case 1:  return "st";
            case 2:  return "nd";
            case 3:  return "rd";
            default: return "th";
        }
    }


    render() {
        console.log("APP STATE", this.state);
        var propsData = {
            login: this.login,
            logout:this.logout,
            logout:this.logout,
            getName:this.getName,
            getNameAlt:this.getNameAlt,
            getFullName:this.getFullName,
            formatDOB:this.formatDOB,
            formatDate:this.formatDate,
            formatDateTime:this.formatDateTime,
            formatHumanDate:this.formatHumanDate,
            getRemainingDays:this.getRemainingDays,
            reloadWishlist:this.reloadWishlist,
            reload:this.reload,
            verify:this.verify,
            firstname:this.state.firstname,
            lastname:this.state.lastname,
            username:this.state.username,
            avatar:this.state.avatar,
            verified:this.state.verified,
            isLoggedIn:this.state.isLoggedIn,
            wishlist:this.state.wishlist,
            dob:this.state.dob,
            color1: '#fff',
            color2: '#58b1ed',
            color3: '#555',
            color4: '#aaa'
        };

        var content = this.state.loading ? <Loading /> :
            <Home data={propsData}/>
        return (
          <BrowserRouter>
                <Switch>
                    <Route exact path="/" component={() => 
                        content
                    }/>
                    <Route exact path="/l/:id" component={() => 
                        content
                    }/>
                    <Route exact path="/pl/:pid" component={() => 
                        content
                    }/>
                    <Route exact path="/login" component={() =>
                        <Login data={propsData}/>
                    }/>
                    <Route exact path="/logout" component={() =>
                        <Logout data={propsData}/>
                    }/>
                    <Route exact path="/reset" component={() =>
                        <Reset data={propsData}/>

                    }/>
                    <Route exact path="/verify" component={() =>
                        <Verify data={propsData}/>

                    }/>
                    <Route exact path="/profile" component={() =>
                        <Profile data={propsData}/>

                    }/>

                    
                </Switch>
                <ToastContainer delay={2000} />
            </BrowserRouter>
        );
    }
}

export default App;
