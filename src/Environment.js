import { useSelector } from "react-redux";

export const Environment = {
  // BaseURL: "https://api.thoriumorganicfoods.com",
  BaseURL: "https://printing-api.onrender.com",
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
