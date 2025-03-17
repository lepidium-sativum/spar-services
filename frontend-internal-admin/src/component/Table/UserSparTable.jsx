import React, { useMemo, useState, useEffect } from "react";
import { MantineReactTable } from "mantine-react-table";
import { MantineProvider } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import ConversionModal from "../Modal/ConversionModel";
import { useDispatch } from "react-redux";
import {
  getAnalysisData,
  postAnalysisData,
} from "../../../store/thunk/commonThunk";
import { setLoader } from "../../../store/slices/commonSlice";

const UserSparTable = ({ data, user_id, handleDelete }) => {
  // console.log("data: ", data.spars);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const formatDate = (timestamp) => {
    return timestamp.substring(0, 10);
  };
  const Data = data?.spars;
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [conversation, setConversation] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
  const [rowSelection, setRowSelection] = useState([]);

  const columns = useMemo(
    () => [
      {
        accessorKey: "id",
        header: "Spar Id",
        enableSorting: true,
      },
      {
        accessorKey: "created_at",
        header: "Date",
        Cell: ({ cell }) => {
          return <div>{formatDate(cell.getValue())}</div>;
        },
      },
      {
        id: "transcripts",
        header: "Transcripts",
        columnDefType: "display",
        enableColumnOrdering: true,
        Cell: ({ row }) => (
          <span
            onClick={() =>
              handleOpenModal(JSON.parse(row.original.conversation))
            }
            className=" underline cursor-pointer"
          >
            Link
          </span>
        ),
      },
      {
        id: "analysis",
        header: "Analysis",
        columnDefType: "display",
        enableColumnOrdering: true,
        Cell: ({ row }) => (
          <span
            onClick={() =>
              handleAnalysis(row?.original?.id, row?.original?.state)
            }
            className=" underline cursor-pointer"
          >
            Link
          </span>
        ),
      },
      {
        accessorKey: "state",
        header: "State",
      },
      {
        id: "delete",
        header: "Actions",
        columnDefType: "display",
        Cell: ({ row }) => (
          <button
            onClick={() => handleDelete(row.original.id)} // Call parent handleDelete function
            className="bg-[#0070ff] text-white px-2 py-1 rounded"
          >
            Delete
          </button>
        ),
      },
    ],
    [navigate]
  );

  const handleAnalysis = (id, state) => {
    if (state === "pending") {
      alert("You can't see result for pending state");
    } else {
      dispatch(getAnalysisData(parseInt(id)))
        .then((res) => {
          if (res?.payload?.data?.state === "finished") {
            console.log("response getAnalysis success: ", res?.payload);
            const analysisId = res?.payload?.data?.id;
            dispatch(setLoader(false));
            navigate("/my-stats", {
              state: { sparId: id, analysisId, userId: user_id },
            });
          } else if (res?.payload?.data?.state === "failed") {
            // alert("Failed", "Analysis doesn't exist");
            console.log("response getAnalysis failed: ", res?.payload);
            navigate("/my-stats", {
              state: { sparId: id, userId: user_id },
            });
          } else if (res?.payload === 404) {
            console.log("inside 404 analysis data: ", res?.payload);
            dispatch(postAnalysisData(parseInt(id)))
              .then((res) => {
                if (res?.payload?.data?.status === 200) {
                  console.log("response postAnalysis: ", res?.payload);
                  const analysisId = res?.payload?.data?.id;
                  dispatch(setLoader(false));
                  navigate("/my-stats", {
                    state: { sparId: id, analysisId, userId: user_id },
                  });
                }
              })
              .catch((error) => {
                console.log(error);
              });
          }
        })
        .catch((error) => {
          console.log(error);
        });
    }
  };
  const handleOpenModal = (data) => {
    // console.log("Opening modal with conversation: ", data); // Add this log to debug
    setConversation(data);
    setIsOpenModal(true);
  };

  return (
    <div className="relative w-full overflow-x-auto shadow-md sm:rounded-lg bg-[#928C8C] ">
      <MantineProvider>
        <MantineReactTable
          columns={columns}
          data={Data}
          initialState={{ sorting: [{ id: "id", desc: true }] }} // false for ascending order
          enableTopToolbar={false}
          enableBottomToolbar={true}
          enablePinning={true}
          // enableRowSelection={true}
          // enableSelectAll={true}
          mantineTableBodyCellProps={{
            sx: {
              backgroundColor: "#928C8C",
              color: "#ffffff",
              borderBottom: "none",
            },
          }}
          mantineTableProps={{
            highlightOnHover: false,
            sx: {
              borderCollapse: "collapse",
              "& tr": {
                borderBottom: "none",
              },
            },
          }}
          mantineTableHeadCellProps={{
            sx: {
              backgroundColor: "#928C8C",
              color: "#ffffff",
              borderBottom: "none",
            },
          }}
        />
      </MantineProvider>
      {isOpenModal && (
        <ConversionModal
          onClose={() => setIsOpenModal(false)}
          data={conversation}
        />
      )}
    </div>
  );
};

export default UserSparTable;
