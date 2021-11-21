import React from 'react';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import Home from '../Routes/Home';
import Header from './Header';


export default () => (
    <Router>
        <Header/>
        <Routes>
            <Route path='/' exact element={<Home/>}/>
        </Routes>
    </Router>
);