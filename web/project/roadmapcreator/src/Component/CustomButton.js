import React from 'react';
import styled from 'styled-components';

const Button = styled.button`
    color: white;
    background-color: #3498db;
    border-radius: 5px;
    border-style: hidden;
    padding: 8px 19px;
    
    &:hover {
        background-color: #0076c5;
        cursor: pointer;
    }
`;

const CustomButton = (props) => {
    return (
        <Button>
            {props.value}
        </Button>
    );
}

export default CustomButton;
