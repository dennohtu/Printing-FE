import axios from "axios";
import { useState } from "react";
import { useSelector } from "react-redux";
import { Environment } from "../Environment";

const useFetch = () => {
  const [loading, setLoading] = useState(false);
  const { user } = useSelector((state) => state.user);

  const runFetch = async ({ url, method, body, params }) => {
    setLoading(true);
    try {
      const response = await axios({
        url: `${Environment.BaseURL}/api${url}`,
        method: method,
        data: body ? body : undefined,
        params: params ? params : undefined,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: "Bearer " + user.token,
        },
      });
      setLoading(false);
      if (response.data) {
        return {
          data: response.data,
          error: null,
        };
      } else {
        return {
          data: null,
          error: "No data received from server",
        };
      }
    } catch (error) {
      setLoading(false);
      if (error.response) {
        // Request made but the server responded with an error
        if (error.response.data) {
          return {
            data: null,
            error: error.response.data.message
              ? error.response.data.message
              : error.response.data,
          };
        } else {
          return {
            data: null,
            error: error.response,
          };
        }
      } else if (error.request) {
        // Request made but no response is received from the server.
        return {
          data: null,
          error: "Did not receive response From server",
        };
      } else {
        // Error occured while setting up the request
        return {
          data: null,
          error: error.message,
        };
      }
    }
  };

  return {
    loading,
    runFetch,
  };
};

export default useFetch;
