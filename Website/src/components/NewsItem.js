import React from "react";

const NewsItem = (props) => {
  const { value } = props;

  return (
    <div className="row-wrapper">
      <span>{value}</span>
    </div>
  );
};

export default NewsItem;
