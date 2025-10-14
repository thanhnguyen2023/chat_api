import { customClass } from "@/styles/style";
import React, { useState } from "react";
import ImageLazyLoader from "../shared/ImageLazyLoader";
import { useAPI } from "@/hooks/useApi";
import { LoginApiRespone } from "@/types/User.type";
import { useUserStore } from "@/stores/UserStore";
import { toast } from "sonner";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isFocusEmailInput, setIsFocusEmailInput] = useState<boolean>(false);
  const [isFocusPassInput, setIsFocusPassInput] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false); 
  const { post } = useAPI();
  const { setUser } = useUserStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data: LoginApiRespone = await post("/api/auth/login", {
        email: email,
        password: password,
      });
      setUser({...data.data,access_token:data.token}); 
      
    } catch (error: any) {
      toast.error("Đăng nhập thất bại", {
        description: (
          <span className="font-extrabold">
            {error.message || "Lỗi gì đó rồi"}
          </span>
        ),
        position: "top-center",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-5">
      <div className="flex justify-around w-full max-w-5xl overflow-hidden shadow-sm">
        <div className="hidden lg:flex w-[40%]">
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

          <form className="space-y-3" onSubmit={handleSubmit}>
            {/* Email input */}
            <div className="relative">
              <input
                type="text"
                placeholder=""
                value={email}
                id="field-input-account"
                onFocus={() => setIsFocusEmailInput(true)}
                onBlur={() =>
                  setIsFocusEmailInput(email !== "" ? true : false)
                }
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full px-3 py-3 border border-gray-300 rounded bg-gray-50 text-sm focus:outline-none focus:border-gray-400 focus:bg-white`}
              />
              <span
                className={`${
                  isFocusEmailInput
                    ? "top-0 text-[9px]"
                    : "top-3 left-3 text-xs"
                } ease-linear duration-150 left-3 pointer-events-none absolute text-[rgb(115,115,115)]`}
              >
                Số điện thoại, tên người dùng hoặc email
              </span>
            </div>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"} 
                placeholder=""
                value={password}
                id="field-input-password"
                onFocus={() => setIsFocusPassInput(true)}
                onBlur={() =>
                  setIsFocusPassInput(password !== "" ? true : false)
                }
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-3 border border-gray-300 rounded bg-gray-50 text-sm focus:outline-none focus:border-gray-400 focus:bg-white pr-14"
              />
              <span
                className={`${
                  isFocusPassInput
                    ? "top-0 text-[9px]"
                    : "top-3 left-3 text-xs"
                } ease-linear duration-150 left-3 pointer-events-none absolute text-[rgb(115,115,115)]`}
              >
                Mật khẩu
              </span>

        
              {password && (
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold border border-black px-2 rounded-sm hover:opacity-80"
                >
                  {showPassword ? "Ẩn" : "Hiện"}
                </button>
              )}
            </div>

            <button
              className="w-full py-3 bg-blue-500 text-white rounded-lg text-sm font-semibold hover:bg-blue-600 transition-colors mt-3"
            >
              Đăng nhập
            </button>
          </form>

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
