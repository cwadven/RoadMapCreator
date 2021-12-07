import React from 'react';
import styled from 'styled-components';
import {withRouter} from "CustomHock/withRouter";

const Container = styled.footer`
    display: grid;
    place-items: center;
    margin-top: auto;
    padding: 50px 0;
    font-size: 15px;
    text-align: center;
    line-height: 1.5;
`;

const Footer = (props) => {
    return (
        <Container>
            Thank You for Visiting RoadMapSite, Have a Good Day 😆
            <br/>© 2021 Developer Lee, Powered By React & Django.
        </Container>
    );
}

export default withRouter(Footer);
