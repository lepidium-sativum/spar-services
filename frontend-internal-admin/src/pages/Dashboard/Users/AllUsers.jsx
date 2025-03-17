// import React, { useState, useEffect } from "react";
import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from "react";
import assets from "../../../constants/assets";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import {
  getAllClientUsers,
  assignModules,
} from "../../../../store/thunk/commonThunk";
import { MantineReactTable, useMantineReactTable } from "mantine-react-table";
import { MantineProvider, Menu } from "@mantine/core";
import Button from "../../../component/Button/Button";
import SparLoader from "../../../component/Loader/SparLoader";
// import { deleteClientUser } from "../../../../store/thunk/commonThunk";

const AllUsers = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [allClientsUsers, setAllClientsUsers] = useState("");
  const [allUsers, setAllUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [originalUsers, setOriginalUsers] = useState();
  const isLoader = useSelector((state) => state.commonReducer.loader);

  useEffect(() => {
    dispatch(getAllClientUsers())
      .then((response) => {
        if (response?.payload?.status === 200) {
          const data = response?.payload?.data;

          const combinedUserData = data.flatMap((client) =>
            client.users.map((user) => ({
              ...user,
              clientName: client.name,
            }))
          );

          setAllUsers(combinedUserData); // Set the updated user data with client names
          setAllClientsUsers(data);
          setOriginalUsers(combinedUserData);
        }
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, [dispatch]);

  const handleDelete = (id, name) => {
    const confirmDeletion = window.confirm(`Are you sure to delete this user`);

    if (confirmDeletion) {
      dispatch(deleteClientUser(id))
        .then((response) => {
          if (response?.payload?.status === 200) {
            console.log("User deleted Successfully");
            const updatedUserData = allUsers.filter((user) => user.id !== id);
            setAllUsers(updatedUserData);
          }
        })
        .catch((error) => {
          console.error("Error deleting Client User:", error);
        });
    } else {
      alert("Deletion canceled");
    }
  };

  const onChangeHandler = (event) => {
    setSearchTerm(event.target.value);
    onSearchHandler(event.target.value);
  };

  const onSearchHandler = (data) => {
    if (data.trim() === "") {
      setAllUsers(originalUsers);
    } else {
      const resultData = allUsers.filter((item) => {
        return Object.keys(item).some((key) => {
          if (typeof item[key] === "string") {
            return item[key].toLowerCase().includes(data.toLowerCase());
          }
          return false;
        });
      });
      setAllUsers(resultData);
    }
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "id",
        header: "Id",
        size: 50,
      },
      {
        accessorKey: "first_name",
        header: "Name",
      },
      {
        accessorKey: "username",
        header: "User Name",
      },
      {
        accessorKey: "email",
        header: "Email",
      },
      {
        accessorKey: "clientName",
        header: "Client Name",
      },
      // {
      //   accessorKey: "Delete",
      //   header: "Delete",
      //   Cell: ({ row }) => (
      //     <Button
      //       onClick={() => handleDelete(row.original.id, row.original.username)}
      //     >
      //       <img
      //         src={assets.trashBlack}
      //         alt="Delete icon"
      //         className="cursor-pointer w-6 h-6"
      //       />
      //     </Button>
      //   ),
      // },
    ],
    []
  );

  const tableInstance = useMantineReactTable({
    columns: columns,
    data: allUsers || [],
  });

  return (
    <>
      {isLoader ? (
        <SparLoader />
      ) : (
        <div className=" h-full overflow-auto flex flex-col text-red-50 w-full">
          <div className="flex flex-row ">
            <h2 className=" text-3xl font-bold text-black mb-4 tracking-[0.24px]">
              List of available Users
            </h2>

            <div className="relative text-center w-3/4 max-w-[600px] ml-10 justify-center mb-4 ">
              <input
                value={searchTerm}
                onChange={onChangeHandler}
                type="text"
                name="search"
                placeholder="Search"
                className={`w-full m-auto h-12 bg-transparent border border-grey500 rounded-3xl p-[14px] focus:outline-none focus:border-primary transition placeholder-placeholder text-black`}
              />
            </div>
          </div>
          <div className="overflow-y-auto p-1 hide-scrollbar">
            {allClientsUsers && (
              <MantineProvider>
                <MantineReactTable
                  table={tableInstance}
                  positionToolbarAlertBanner={"none"}
                />
              </MantineProvider>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default AllUsers;
