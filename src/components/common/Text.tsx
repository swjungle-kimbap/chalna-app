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
  font-size: 12px;
  color: #979797;
`;

type TextProps = {
  children: React.ReactNode;
  variant?: "title" | "main" | "sub";
  style?: object;
  numberOfLines?: any;
};

const Text: React.FC<TextProps> = ({ children, numberOfLines, variant="main", ...rest}) => {
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
    <TextWrapper {...rest}>
      <TextComponent>
        {children}
      </TextComponent>
    </TextWrapper>
  );
};

const TextWrapper = styled.View`
  justify-content: center;
  align-items: center;
  text-align: center;
`;

export default Text;
