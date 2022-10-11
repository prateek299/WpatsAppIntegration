import React, { useState } from 'react';
import { connect } from 'react-redux';
import { Link ,Navigate } from 'react-router-dom';
import { setAlert } from '../../actions/alert';
import { register } from '../../actions/auth';
import PropTypes from 'prop-types';

 const Register = ({setAlert, register, isAuthenticated}) => {

  const [formData, setFormData] = useState({
    mobileno: '',
    wabappid: '',
    accesstoken: '',
    password: '',
    password2: ''
  });
    
  const { mobileno , wabappid, accesstoken, password, password2 } = formData;

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async (e) => {
        e.preventDefault();
        if (password !== password2) {
          setAlert('Passwords do not match', 'danger');
        } else {
          register({ mobileno , wabappid, accesstoken, password });
        }  
    };
  
    if (isAuthenticated) {
      return <Navigate to="/messages" />;
    }
  
  return (
    <section className='container'>
      <h1 className="large text-primary">Sign Up</h1>
      <p className="lead">
        <i className="fas fa-user"></i> Create Your Account
      </p>
      <form className="form" onSubmit={onSubmit}>
        <div className="form-group">
          <input 
            type="text" 
            placeholder="Mobile Number" 
            name="mobileno"
            required
            value={mobileno}
            onChange={onChange}
          />
        </div>
        <div className="form-group">
          <input 
            type="text" 
            placeholder="Whatsapp Business App ID" 
            name="wabappid"
            required
            value={wabappid}
            onChange={onChange}
          />
        </div>
        <div className="form-group">
          <input
            type="text"
            placeholder="Access Token"
            name="accesstoken"
            required
            value={accesstoken}
            onChange={onChange}
          />
        </div>
        <div className="form-group">
          <input
            type="password"
            placeholder="Password"
            name="password"
            value={password}
            onChange={onChange}
          />
        </div>
        <div className="form-group">
          <input
            type="password"
            placeholder="Confirm Password"
            name="password2"
            value={password2}
            onChange={onChange}
          />
        </div>
        <input type="submit" className="btn btn-primary" value="Register" />
      </form>
      <p className="my-1">
        Already have an account? <Link to="/login">Sign In</Link>
      </p>
    </section>
  );
};

Register.propTypes = {
  setAlert: PropTypes.func.isRequired,
  register: PropTypes.func.isRequired,
  isAuthenticated: PropTypes.bool
};

const mapStateToProps = (state) => ({
  isAuthenticated: state.auth.isAuthenticated
});

export default connect(mapStateToProps, { setAlert, register })(Register);
