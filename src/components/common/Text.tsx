import styled from "styled-components/native";
import React from 'react';

const TitleText = styled.Text`
  font-family: ${(props) => props.theme.fonts.title};
  font-size: 24px;
  color: #060606;
`;

const TitleTextSmall = styled.Text`
  font-family: ${(props) => props.theme.fonts.title};
  font-size: 22px;
  color: #060606;
`;

const SubTitleText = styled.Text`
  font-family: ${(props) => props.theme.fonts.title};
  font-size: 20px;
  color: #060606;
`;

const MainBold = styled.Text`
  font-family: ${(props) => props.theme.fonts.title};
  font-size: 17px;
  color: #060606;
`;


const MainText = styled.Text`
  font-family: ${(props) => props.theme.fonts.main};
  font-size: 15px;
  color: #060606;
`;

const SubText = styled.Text`
  font-family: ${(props) => props.theme.fonts.sub};
  font-size: 12px;
  color: #979797;
`;

const SubTextBold = styled.Text`
  font-family: ${(props) => props.theme.fonts.title};
  font-size: 12px;
  color: #3A3B3C;
`;

type TextProps = {
    children: React.ReactNode;
    variant?: "title" |"titleSmall"| "subtitle" | "mainBold" | "main" | "sub" | "subBold";
    style?: object;
    numberOfLines?: number;
    align?: "left"|"center"|"right"; //text 정렬
};

const Text: React.FC<TextProps> = ({ children, numberOfLines, variant="main", align="center",...rest}) => {
    let TextComponent: React.ElementType;

    switch (variant) {
        case "title":
            TextComponent = TitleText;
            break;
        case "titleSmall":
            TextComponent = TitleTextSmall;
            break;
        case "subtitle":
            TextComponent = SubTitleText;
            break;
        case "mainBold":
            TextComponent = MainBold;
            break;
        case "main":
            TextComponent = MainText;
            break;
        case "sub":
            TextComponent = SubText;
            break;
        case "subBold":
            TextComponent = SubTextBold;
            break;

        default:
            TextComponent = MainText;
    }

    return (
        <TextWrapper align={align}>
            <TextComponent {...rest}>
                {children}
            </TextComponent>
        </TextWrapper>
    );
};

const TextWrapper = styled.View<{ align: "left" | "center" | "right" }>`
    justify-content: ${({ align }) => (align === "center" ? "center" : "flex-start")};
    align-items: center;
    text-align: ${({ align }) => align};
`;


export default Text;
