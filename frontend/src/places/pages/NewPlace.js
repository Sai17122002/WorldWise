import React, { useContext, useCallback, useState } from "react";
import { useHistory } from "react-router-dom";

import Input from "../../shared/components/FormElements/Input";
import Button from "../../shared/components/FormElements/Button";
import ErrorModal from "../../shared/components/UIElements/ErrorModal";
import LoadingSpinner from "../../shared/components/UIElements/LoadingSpinner";
import ImageUpload from "../../shared/components/FormElements/ImageUpload";
import {
  VALIDATOR_REQUIRE,
  VALIDATOR_MINLENGTH,
} from "../../shared/util/validators";
import { useForm } from "../../shared/hooks/form-hook";
import { AuthContext } from "../../shared/context/auth-context";
import { Axios } from "axios";
import "./PlaceForm.css";

const NewPlace = () => {
  const auth = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const clearError = () => {
    setError(null);
  };
  const [formState, inputHandler] = useForm(
    {
      title: {
        value: "",
        isValid: false,
      },
      description: {
        value: "",
        isValid: false,
      },
      address: {
        value: "",
        isValid: false,
      },
      image: {
        value: null,
        isValid: false,
      },
    },
    false
  );

  const history = useHistory();
  const sendRequest = useCallback(
    async (url, method = "GET", body = null, headers = {}) => {
      setIsLoading(true);
      try {
        console.log(url,method, body, headers);
        headers={'Content-Type': 'application/json',...headers}
        const response = await fetch(url, {
          method: method,
          body: JSON.stringify(body),
          headers: headers,
          mode: 'cors',
          cache: 'default',
        });

        const responseData = await response.json();

        if (!response.ok) {
          throw new Error(responseData.message);
        }

        setIsLoading(false);
        return responseData;
      } catch (err) {
        setError(err.message);
        setIsLoading(false);
        throw err;
      }
    },
    []
  );
  const placeSubmitHandler = async (event) => {
    event.preventDefault();

    try {
      const formData = {
        title: formState.inputs.title.value,
        description: formState.inputs.description.value,
        address: formState.inputs.address.value,
        image: formState.inputs.image.value,
        creator: auth.userId
      };
      console.log(formData);
      //Storing image into s3 bucket
      const url = await fetch(`${process.env.REACT_APP_BACKEND_URL}/s3Url`, {
        method: "GET",
        body: null,
        headers: {},
      });
      console.log(formState.inputs.image.value);
      const responseData1 = await url.json();
      await fetch(responseData1.url, {
        method: "PUT",
        headers: {
          "Content-Type": "multipart/form-data",
        },
        body: formState.inputs.image.value,
      });
      const imageUrl = responseData1.url.split("?")[0];

      inputHandler("image", imageUrl, true);
      await sendRequest(
        process.env.REACT_APP_BACKEND_URL + "/api/places",
        "POST",
        formData,
        {
          Authorization: "Bearer " + auth.token,
        }
      );
      history.push("/");
    } catch (err) {}
  };

  return (
    <React.Fragment>
      <ErrorModal error={error} onClear={clearError} />
      <form className="place-form" onSubmit={placeSubmitHandler}>
        {isLoading && <LoadingSpinner asOverlay />}
        <Input
          id="title"
          element="input"
          type="text"
          label="Title"
          validators={[VALIDATOR_REQUIRE()]}
          errorText="Please enter a valid title."
          onInput={inputHandler}
        />
        <Input
          id="description"
          element="textarea"
          label="Description"
          validators={[VALIDATOR_MINLENGTH(5)]}
          errorText="Please enter a valid description (at least 5 characters)."
          onInput={inputHandler}
        />
        <Input
          id="address"
          element="input"
          label="Address"
          validators={[VALIDATOR_REQUIRE()]}
          errorText="Please enter a valid address."
          onInput={inputHandler}
        />
        <ImageUpload
          id="image"
          onInput={inputHandler}
          errorText="Please provide an image."
        />
        <Button type="submit" disabled={!formState.isValid}>
          ADD PLACE
        </Button>
      </form>
    </React.Fragment>
  );
};

export default NewPlace;
