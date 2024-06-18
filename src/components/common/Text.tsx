import styled from "styled-components/native";
import React from 'react';

const TitleText = styled.Text`
  font-family: ${(props) => props.theme.fonts.title};
  font-size: 24px;
  color: #060606;
`;

const MainText = styled.Text`
  font-family: ${(props) => props.theme.fonts.main};
  font-size: 15px;
  color: #060606;
`;

const SubText = styled.Text`
  font-family: ${(props) => props.theme.fonts.sub};
  font-size: 14px;
  color: #979797;
`;

type TextProps = {
  children: React.ReactNode;
  variant?: "title" | "main" | "sub";
};

const Text: React.FC<TextProps> = ({ children, variant="main"}) => {
  let TextComponent: React.ElementType;

  switch (variant) {
    case "title":
      TextComponent = TitleText;
      break;
    case "main":
      TextComponent = MainText;
      break;
    case "sub":
      TextComponent = SubText;
      break;
    default:
      TextComponent = MainText;
  }

  return (
      <TextComponent>
      {children}
      </TextComponent>
  );
};

const TextWrapper = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  text-align: center;
`;

export default Text;
