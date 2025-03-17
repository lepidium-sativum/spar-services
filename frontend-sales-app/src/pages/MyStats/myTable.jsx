const MyTable = () => {
  let data = [
    { number: "01", name: "Ali", stars: 40 },
    { number: "02", name: "ahmad", stars: 30 },
    { number: "03", name: "Qasim", stars: 60 },
    { number: "04", name: "Farman", stars: 70 },
    { number: "05", name: "Salman", stars: 40 },
    { number: "06", name: "Kamran", stars: 80 },
  ];
  return (
    <div className="container w-[800px]">
      <div className="flex flex-col mt-6">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden border border-gray-200 dark:border-gray-700 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 ">
                <thead className="bg-black-800">
                  <tr>
                    <th
                      scope="col"
                      className="py-3.5 px-4 text-left rtl:text-right text-gray-100 dark:text-gray-400"
                    >
                      #
                    </th>

                    <th
                      scope="col"
                      className="px-12 py-3.5 text-left rtl:text-right text-gray-100 dark:text-gray-400"
                    >
                      Name
                    </th>

                    <th
                      scope="col"
                      className="px-4 py-3.5  text-left rtl:text-right text-gray-100 dark:text-gray-400"
                    >
                      Range
                    </th>

                    <th
                      scope="col"
                      className="px-4 py-3.5 text-left rtl:text-right text-gray-100 dark:text-gray-400"
                    >
                      Collected Stars
                    </th>
                  </tr>
                </thead>

                <tbody className="bg-black-900 divide-y divide-gray-200">
                  {data.map((d) => {
                    return (
                      <tr key={d.number}>
                        <td className="px-4 py-4 text-sm font-medium whitespace-nowrap">
                          <h2 className="font-medium text-gray-200 dark:text-white ">
                            {d.number}
                          </h2>
                        </td>
                        <td className="px-12 py-4 text-sm font-medium whitespace-nowrap">
                          <div className="inline px-3 py-1 text-sm font-normal text-gray-100 gap-x-2">
                            {d.name}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm whitespace-nowrap">
                          <div className="w-48 h-1.5 bg-blue-200 overflow-hidden rounded-full">
                            <div className="bg-blue-500 w-2/3 h-1.5"></div>
                          </div>
                        </td>
                        <td className="px-12 py-4 text-sm font-medium whitespace-nowrap">
                          <div className="inline px-3 py-1 text-sm font-normal text-emerald-400">
                            {d.stars}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default MyTable;
