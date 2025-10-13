import { customClass } from "@/styles/style";
import React, { useState } from "react";
import ImageLazyLoader from "../shared/ImageLazyLoader";
import "./LoginForm.css";
const LoginForm = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const handleSubmit = (e) => {
    e.preventDefault();
  
  };
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-5">
      <div className="flex justify-around w-full max-w-5xl overflow-hidden shadow-sm">
        <div className="hidden lg:flex w-[40%] ">
          <ImageLazyLoader alt="" src="/landing-3x.png" />
        </div>

        <div className="w-[95%] md:w-[70%] lg:w-[40%] p-4 flex flex-col justify-center">
          <div className="text-center mb-8">
            <i
              data-visualcompletion="css-img"
              aria-label="Instagram"
              role="img"
              style={{
                backgroundImage:
                  'url("https://static.cdninstagram.com/rsrc.php/v4/yz/r/H_-3Vh0lHeK.png")',
                backgroundPosition: "0px -2959px",
                backgroundSize: "auto",
                width: "175px",
                height: "51px",
                backgroundRepeat: "no-repeat",
                display: "inline-block",
              }}
            ></i>
          </div>

          <div className="space-y-3">
            <div className="relative">
              <input
                type="text"
                placeholder=""
                value={username}
                id="field-input-account"
                onChange={(e) => setUsername(e.target.value)}
                className=" w-full px-3 py-3 border border-gray-300 rounded bg-gray-50 text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
              />
              <span
                id="placeholder-fake-account"
                className="pointer-events-none absolute top-3 left-3 text-xs text-[rgb(115,115,115)]"
              >
                Số điện thoại, tên người dùng hoặc email
              </span>
            </div>

            <div className="relative">
              <input
                type="password"
                placeholder=""
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                id="field-input-password"
                className=" w-full px-3 py-3 border border-gray-300 rounded bg-gray-50 text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
              />
              <span
                id="placeholder-fake-password"
                className="pointer-events-none absolute top-3 left-3 text-[rgb(115,115,115)]  text-xs"
              >
                Mật khẩu
              </span>
            </div>

            <button
              onClick={handleSubmit}
              className="w-full py-3 bg-blue-500 text-white rounded-lg text-sm font-semibold hover:bg-blue-600 transition-colors mt-3"
            >
              Đăng nhập
            </button>
          </div>

          <div className="flex items-center my-5">
            <div className="flex-1 h-px bg-gray-300"></div>
            <span className="px-5 text-gray-500 text-sm font-semibold">
              HOẶC
            </span>
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>

          <button
            onClick={() => console.log("Facebook login")}
            className="flex items-center justify-center gap-2 text-blue-900 font-semibold text-sm mb-5 hover:opacity-80"
          >
            <div className="w-5 h-5 bg-blue-900 rounded-full flex items-center justify-center text-white text-xs font-bold">
              f
            </div>
            Đăng nhập bằng Facebook
          </button>

          <button
            onClick={() => console.log("Forgot password")}
            className="text-center text-blue-900 text-xs mb-10 hover:opacity-80"
          >
            Quên mật khẩu?
          </button>

          <div className="text-center text-sm text-gray-800">
            Bạn chưa có tài khoản ư?{" "}
            <button
              onClick={() => console.log("Sign up")}
              className="text-blue-500 font-semibold hover:opacity-80"
            >
              Đăng ký
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;

// <div>
//     <main className={`${customClass["combo-flex"]}`}>
//       {/* <div>
//               <ImageLazyLoader src='landing-3x.png' alt=''  />
//           </div> */}
//       <div className="max-w-[350px]">
//         <div>
//           {/* icon */}
//
//         </div>
//         <form>
//           <div>
//             <span>Số điện thoại, tên người dùng hoặc email</span>
//             <input
//             className="bg-[rgb(250,250,250,1)] w-full pt-[9px] pr-0 pb-[7px] pl-[8px] text-red-600"
//               aria-label="Số điện thoại, tên người dùng hoặc email"
//               aria-required="true"
//               autoCapitalize="off"
//               autoCorrect="off"
//               maxLength={75}
//               type="text"

//               name="username"
//             />
//           </div>

//           <div></div>
//         </form>
//       </div>
//     </main>
//   </div>
