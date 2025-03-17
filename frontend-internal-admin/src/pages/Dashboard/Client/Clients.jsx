import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import Button from "../../../component/Button/Button";
import ClientTable from "../../../component/Table/ClientTable";
import {
  getClients,
  deleteClient,
  configApi,
} from "../../../../store/thunk/commonThunk";
import SparLoader from "../../../component/Loader/SparLoader";
import AddClientModal from "../../../component/Modal/AddClientModal";
import { useLocation } from "react-router-dom";

const Clients = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  // const clientList = useSelector((state) => state.commonReducer.clientList);
  // console.log("client list: ", clientList);

  const isLoader = useSelector((state) => state.commonReducer.loader);
  const [searchTerm, setSearchTerm] = useState("");
  // const [data, setData] = useState(clientList);
  const [clientData, setClientsData] = useState("");
  const [originalClient, setOriginalClient] = useState();
  const [openModal, setOpenModal] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState(null);

  const handleEdit = (isEditing, clientId) => {
    setOpenModal(isEditing);
    setSelectedClientId(clientId);
  };
  const handleOpen = () => {
    setOpenModal(true);
    setSelectedClientId(null);
  };

  const handleDelete = (clientId) => {
    if (window.confirm("Are you sure you want to delete this client?")) {
      dispatch(deleteClient(clientId))
        .then((response) => {
          if (response?.payload?.status === 200) {
            console.log("Client deleted successfully");
            const updatedClientData = clientData.filter(
              (client) => client.id !== clientId
            );
            setClientsData(updatedClientData);
            setOriginalClient(updatedClientData);
          }
        })
        .catch((error) => {
          console.error("Error deleting client:", error);
        });
    }
  };

  useEffect(() => {
    dispatch(configApi());
  }, []);

  useEffect(() => {
    dispatch(getClients())
      .then((response) => {
        if (response?.payload?.status === 200) {
          const sortedData = response?.payload?.data;
          setClientsData(sortedData);
          setOriginalClient(sortedData);
          setSelectedClientId(null);
        }
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, [dispatch, location]);

  const onSearchHandler = (data) => {
    if (data.trim() === "") {
      setClientsData(originalClient);
    } else {
      const resultData = originalClient.filter((item) => {
        return Object.keys(item).some((key) => {
          if (typeof item[key] === "string") {
            return item[key].toLowerCase().includes(data.toLowerCase());
          }
          return false;
        });
      });
      setClientsData(resultData);
    }
  };

  const onChangeHandler = (event) => {
    setSearchTerm(event.target.value);
    onSearchHandler(event.target.value);
  };

  return (
    <>
      {isLoader ? (
        <SparLoader />
      ) : (
        <div className=" h-full overflow-auto flex flex-col text-red-50 w-full">
          <div className={`form-filed mb-0 justify-between flex flex-row`}>
            <h4 className=" text-3xl font-bold font-montserrat text-black mb-4 tracking-[0.24px]">
              Spar List of Companies
            </h4>
            <div className="relative text-center w-full max-w-[600px] ">
              <input
                value={searchTerm}
                onChange={onChangeHandler}
                type="text"
                name="search"
                placeholder="Search"
                className={`w-full m-auto h-12 bg-transparent border border-grey500 rounded-xl p-[14px] focus:outline-none focus:border-primary transition placeholder-placeholder text-black`}
              />
            </div>
            <div className=" justify-end">
              <Button onClick={handleOpen} className="btn btn-gradient-Blue ">
                Create a Client
              </Button>
            </div>
          </div>
          {clientData && clientData.length ? (
            <div className="">
              <ClientTable
                data={clientData}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </div>
          ) : (
            <div className="custom-box mt-10 h-[calc(100vh-310px)] bg-[linear-gradient(128.49deg,#333333_0%,#232323_100%),linear-gradient(335.03deg,#464646_0%,#1A1A1A_100%)] flex justify-center items-center">
              <div className="text-center flex flex-col justify-center items-center p-6">
                {!originalClient?.length ? (
                  <>
                    <p className="primary font-bold text-[19px] mb-2">
                      No Client created yet...
                    </p>
                    <span className="text-white mb-8">
                      Start by creating a client by clicking on the button below
                    </span>
                    <Button
                      onClick={() => setOpenModal(true)}
                      className="btn btn-gradient "
                    >
                      Create a Client
                    </Button>
                  </>
                ) : (
                  <p className="primary font-bold text-[19px] mb-2">
                    No Result Found
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
      {openModal && (
        <AddClientModal
          onClose={() => setOpenModal(false)}
          clientId={selectedClientId}
        />
      )}
    </>
  );
};

export default Clients;
