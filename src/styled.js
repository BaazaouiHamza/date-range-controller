import styled from "styled-components";

export const BlockedTd = styled.td`
  width: ${(props) => props.daySize};
  height: ${(props) => props.daySize};
  color: ${(props) => (props.isOutsideDay ? "#cacccd" : "black")};
  box-sizing: border-box;
  cursor: pointer;
  border-collapse: collapse;
  border: 2px solid rgba(255, 255, 255, 1);
  border-spacing: 0;
  background-color: ${(props) => (props.isOutsideDay ? "white" : props.color)};
  border-radius: 7px;
`;

export const Day = styled.div`
  box-shadow: border-box;
  -webkit-box-sizing: border-box;
  -moz-box-sizing: border-box;
  display: flex;
  display: -webkit-flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  width: ${(props) => props.daySize}
  height: ${(props) => props.daySize};
  span {
    font-weight:700
  }
`;

export const HighLightedTd = styled.td`
  width: ${(props) => props.daySize};
  height: ${(props) => props.daySize};
  color: ${(props) => (props.isOutsideDay ? "#cacccd" : "black")};
  box-sizing: border-box;
  cursor: pointer;
  border-collapse: collapse;
  border: 2px solid rgba(255, 255, 255, 1);
  border-spacing: 0;
  background: ${(props) =>
    props.isOutsideDay
      ? "white"
      : `linear-gradient(to top left, ${props.color1}  47%, transparent 47%, transparent 53%,  ${props.color2} 53%)`};
  border-radius: 7px;
`;

export const CheckTd = styled.td`
  width: ${(props) => props.daySize};
  height: ${(props) => props.daySize};
  color: ${(props) => (props.isOutsideDay ? "#cacccd" : "black")};
  box-sizing: border-box;
  pointer-events: ${(props) =>
    props.blocked || props.isOutsideDay ? "none" : "auto"};
  cursor: ${(props) =>
    props.blocked || props.isOutsideDay ? "default" : "pointer"};
  border-collapse: collapse;
  border: 2px solid rgba(255, 255, 255, 1);
  border-spacing: 0;
  background: ${(props) =>
    props.isOutsideDay
      ? "white"
      : props.selectedStart
      ? `linear-gradient(to top left, rgb(0, 143, 148)  47%, transparent 47%, transparent 53%,  ${props.color} 53%)`
      : props.selectedEnd
      ? `linear-gradient(to top left, ${props.color}  47%, transparent 47%, transparent 53%,  rgb(0, 143, 148) 53%)`
      : props.checkIn
      ? `linear-gradient(to top left, ${props.color} 50%, transparent 50%)`
      : `linear-gradient(to bottom right, ${props.color} 50%, transparent 50%)`};
  border-radius: 7px;
`;
