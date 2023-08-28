import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import PlaceList from "../components/PlaceList";
import ErrorModal from "../../shared/components/UIElements/ErrorModal";
import LoadingSpinner from "../../shared/components/UIElements/LoadingSpinner";

const UserPlaces = () => {
  const [loadedPlaces, setLoadedPlaces] = useState();
  const [isLoading, setIsLoading] = useState();
  const [error, setError] = useState(null);
  const userId = useParams().userId;
  const clearError = () => {
    setError(null);
  };
  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BACKEND_URL}/api/places/user/${userId}`,
          {
            method: "GET",
            body: null,
            headers: {},
          }
        );

        const responseData = await response.json();

        if (!response.ok) {
          throw new Error(responseData.message);
        }

        setIsLoading(false);
        setLoadedPlaces(responseData.places);
      } catch (err) {
        setError(err.message);
        setIsLoading(false);
      }
    };
    fetchPlaces();
  }, [userId]);

  const placeDeletedHandler = (deletedPlaceId) => {
    setLoadedPlaces((prevPlaces) =>
      prevPlaces.filter((place) => place.id !== deletedPlaceId)
    );
  };
  return (
    <React.Fragment>
      <ErrorModal error={error} onClear={clearError} />
      {isLoading && (
        <div className="center">
          <LoadingSpinner />
        </div>
      )}
      {!isLoading && loadedPlaces && (
        <PlaceList items={loadedPlaces} onDeletePlace={placeDeletedHandler} />
      )}
    </React.Fragment>
  );
};

export default UserPlaces;
