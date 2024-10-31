import { useSelector } from "react-redux";

export const Environment = {
  // BaseURL: "https://api.thoriumorganicfoods.com",
  BaseURL: "http://localhost:5001",
};

export const Headers = () => {
  const { user } = useSelector((s) => s.user);
  var _headers = {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: "Bearer " + user.token,
    },
  };
  return _headers;
};
