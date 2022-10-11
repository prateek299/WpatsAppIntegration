import React, { Fragment, useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import MessageItem from './MessageItem';
import { getMessages } from '../../actions/message';

const Messages = ({ getMessages, message : {messages ,loading}}) => {
  useEffect(() => {
    getMessages();
  }, [getMessages]);

  return(
    <section className="container">
        <Fragment>
          <h1 className="medium text-primary">Messages</h1>
          <div className="profiles">
            {messages.length > 0 ? (
              messages.map((message) => (
                <MessageItem key={message._id} message={message} />
              ))
            ) : (
              <h4>No messages found...</h4>
            )}
          </div>
        </Fragment>
    </section>
  );
}; 

Messages.propTypes = {
  getMessages: PropTypes.func.isRequired,
  message: PropTypes.object.isRequired
};

const mapStateToProps = (state) => ({
  message: state.message
});

export default connect(mapStateToProps, { getMessages })(Messages);

