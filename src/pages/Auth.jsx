import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Auth() {
    const location = useLocation();
    const [mode, setMode] = useState(location.state?.mode === 'login' ? 'login' : 'signup');
    const [ error, setError] = useState(null);

    useEffect(() => {
        if (location.state?.mode === 'login' || location.state?.mode === 'signup') {
            setMode(location.state.mode);
            setError(null);
        }
    }, [location.state]);

    const navigate = useNavigate();

    const { signUp, login } = useAuth();

    const {
        register,
        handleSubmit,
        formState: { errors },
     } = useForm();

    function onSubmit(data) {
        setError(null);
        let result;
        if (mode === "signup") {
            result = signUp(data.email, data.password);
        } else {
            result = login(data.email, data.password);
        }

        if (result.success) {
            navigate("/");
        } else {
            setError(result.error);
        }

        console.log(result);
    }

    return (
        <div className="page">
            <div className="container">
                <div className="auth-container">
                    <h1 className="page-title">
                        {mode === "signup" ? "Sign Up" : "Login"}
                    </h1>
                    <form className="auth-form" onSubmit={handleSubmit(onSubmit)}>
                        {error && <div className="error-message">{error}</div>}
                        <div className="form-group">
                            <label className="form-label" htmlFor="email">
                                Email <span className="required-indicator">*</span>
                            </label>
                            <input 
                                className={`form-input ${errors.email ? "form-input-error" : ""}`} 
                                type="email" 
                                id="email"
                                {...register("email", { required: "Email is required" })}
                            />
                            {errors.email && (
                                <span className="form-error">{errors.email.message}</span>
                            )}
                        </div>
                          <div className="form-group">
                            <label className="form-label" htmlFor="password">
                                Password <span className="required-indicator">*</span>
                            </label>
                            <input
                                {...register("password", {
                                required: "Password is required",
                                minLength: {
                                    value: 6,
                                    message: "Password must be at least 6 characters"
                                },
                                maxLength: {
                                    value: 12,
                                    message: "Password must be at most 12 characters",
                                },
                                })}
                                className={`form-input ${errors.password ? "form-input-error" : ""}`}
                                type="password"
                                id="password"
                            />
                            {errors.password && (
                                <span className="form-error">{errors.password.message}</span>
                            )}
                        </div>

                        <button type="submit" className="btn btn-primary btn-large">
                            {mode === "signup" ? "Sign Up" : "Login"}
                        </button>
                    </form>

                    <div className="auth-switch">
                        {mode === "signup" ? (
                            <p>
                            Already have an account?{" "}
                            <span className="auth-link" onClick={() => setMode("login")}>Login</span>
                            </p>
                        ) : (
                            <p>
                            Don't have an account?{" "}
                            <span className="auth-link" onClick={() => setMode("signup")}>Sign Up</span>
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}