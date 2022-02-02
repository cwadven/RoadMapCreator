import { createGlobalStyle } from 'styled-components';
import reset from 'styled-reset';

const GlobalStyles = createGlobalStyle`
    ${reset};
    h3{
        font-size: 22px;
    }
    a{
        text-decoration: none;
        color: inherit;
    }
    * {
        box-sizing: border-box;
    }
    body {
        padding-top: 50px;
    }
`;

export default GlobalStyles;