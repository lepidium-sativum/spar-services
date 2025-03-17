import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import Button from "../../../component/Button/Button";
import ClientUsersTable from "../../../component/Table/ClientUsersTable";
import {
  getClientUsers,
  deleteClientUser,
} from "../../../../store/thunk/commonThunk";
import SparLoader from "../../../component/Loader/SparLoader";
import AddUserModal from "../../../component/Modal/AddUserModal";
import assets from "../../../constants/assets";

const ClientUsers = () => {
  const urlString = window.location.href;
  const url = new URL(urlString);
  const clientId = url.searchParams.get("clientId");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // console.log("client user list: ", clientUsersList);
  const isLoader = useSelector((state) => state.commonReducer.loader);
  const [searchTerm, setSearchTerm] = useState("");
  const [clientUsersData, setClientUsersData] = useState();
  const [originalUsers, setOriginalUsers] = useState();
  const [openModal, setOpenModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);

  // console.log("location: ", additionalData);

  // for edit
  // const handleEdit = (isEditing, userId) => {
  //   setOpenModal(isEditing);
  //   setSelectedUserId(userId);
  // };
  const handleDelete = (userId) => {
    if (window.confirm("Are you sure you want to delete this User?")) {
      dispatch(deleteClientUser(userId))
        .then((response) => {
          if (response?.payload?.status === 200) {
            console.log("User deleted Successfully");
            const updatedUserData = clientUsersData.filter(
              (user) => user.id !== userId
            );
            setClientUsersData(updatedUserData);
            setOriginalUsers(updatedUserData);
          }
        })
        .catch((error) => {
          console.error("Error deleting Client User:", error);
        });
    }
  };
  useEffect(() => {
    if (clientId) {
      dispatch(getClientUsers(clientId))
        .then((response) => {
          if (response?.payload?.status === 200) {
            const sortedData = response?.payload?.data;
            setClientUsersData(sortedData);
            setOriginalUsers(sortedData);
          }
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
        });
    }
  }, [clientId, dispatch, location]);

  const onSearchHandler = (data) => {
    if (data.trim() === "") {
      setClientUsersData(originalUsers);
    } else {
      const resultData = originalUsers.filter((item) => {
        return Object.keys(item).some((key) => {
          if (typeof item[key] === "string") {
            return item[key].toLowerCase().includes(data.toLowerCase());
          }
          return false;
        });
      });
      setClientUsersData(resultData);
    }
  };

  const onChangeHandler = (event) => {
    setSearchTerm(event.target.value);
    onSearchHandler(event.target.value);
  };
  // console.log("list users: ", clientUsersData);
  return (
    <>
      {isLoader ? (
        <SparLoader />
      ) : (
        <div className=" h-full overflow-auto flex flex-col text-red-50 w-full">
          <h2 className=" text-3xl font-bold text-black mb-4 tracking-[0.24px]">
            List of Users
          </h2>

          <div className={`form-filed mb-3 justify-between flex flex-row`}>
            <div className="flex flex-row justify-between w-1/2">
              <div className=" justify-start">
                <img
                  src={assets.back}
                  alt="Go Back"
                  className="w-[30px] h-[30px] mt-2"
                  onClick={() => navigate("/clients")}
                />
              </div>
              <div className="relative text-center w-3/4 max-w-[600px] ">
                <input
                  value={searchTerm}
                  onChange={onChangeHandler}
                  type="text"
                  name="search"
                  placeholder="Search"
                  className={`w-full m-auto h-12 bg-transparent border border-grey500 rounded-xl p-[14px] focus:outline-none focus:border-primary transition placeholder-placeholder text-black`}
                />
              </div>
            </div>

            <div className=" justify-end">
              <Button
                onClick={() => setOpenModal(true)}
                className="btn btn-gradient-Blue "
              >
                Create a User
              </Button>
            </div>
          </div>
          {clientUsersData && clientUsersData.length ? (
            <div className="">
              <ClientUsersTable
                data={clientUsersData}
                //  onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </div>
          ) : (
            <div className="custom-box h-[calc(100vh-310px)] bg-[linear-gradient(128.49deg,#333333_0%,#232323_100%),linear-gradient(335.03deg,#464646_0%,#1A1A1A_100%)] flex justify-center items-center">
              <div className="text-center flex flex-col justify-center items-center p-6">
                {!originalUsers?.length ? (
                  <>
                    <p className="primary font-bold text-[19px] mb-2">
                      No User created yet...
                    </p>
                    <span className="text-white mb-8">
                      Start by creating a User by clicking on the button below
                    </span>
                    <Button
                      onClick={() => setOpenModal(true)}
                      className="btn btn-gradient "
                    >
                      Create a User
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
        <AddUserModal
          onClose={() => setOpenModal(false)}
          client_id={clientId}
        />
      )}
    </>
  );
};

export default ClientUsers;
