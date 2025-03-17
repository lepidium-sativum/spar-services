import { Link, useLocation } from "react-router-dom";

const Header = (props) => {
  const { setShowPopup, showPopup } = props;
  const location = useLocation();
  return (
    <div className="sticky top-0 flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
      <header>
        <div
          className={
            location.pathname == "/module"
              ? "flex justify-between items-start mx-auto pt-8 sm:px-6 lg:px-8 xl:pl-24"
              : "flex justify-end mx-auto px-4 py-8 sm:px-6 lg:px-8"
          }
        >
        </div>
      </header>
    </div>
  );
};

export default Header;
