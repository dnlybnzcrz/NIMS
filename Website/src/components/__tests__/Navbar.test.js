import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import Navigation from "../Navbar";

const renderWithContext = (contextValue) => {
  return render(
    <AuthContext.Provider value={contextValue}>
      <BrowserRouter>
        <Navigation />
      </BrowserRouter>
    </AuthContext.Provider>
  );
};

describe("Navigation component", () => {
  test("renders loading state", () => {
    renderWithContext({ user: null, loading: true, logout: jest.fn() });
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  test("renders guest user when no user", () => {
    renderWithContext({ user: null, loading: false, logout: jest.fn() });
    expect(screen.getByText(/hello, guest/i)).toBeInTheDocument();
  });

  test("renders navigation links for reporter role", () => {
    const user = { role: "reporter", name: { first: "John" } };
    renderWithContext({ user, loading: false, logout: jest.fn() });
    expect(screen.getByText(/home/i)).toBeInTheDocument();
    expect(screen.getByText(/news/i)).toBeInTheDocument();
    expect(screen.queryByText(/approval/i)).not.toBeInTheDocument();
  });

  test("renders additional links for producer role", () => {
    const user = { role: "producer", name: { first: "Jane" } };
    renderWithContext({ user, loading: false, logout: jest.fn() });
    expect(screen.getByText(/approval/i)).toBeInTheDocument();
    expect(screen.getByText(/tags/i)).toBeInTheDocument();
    expect(screen.getByText(/approved reports/i)).toBeInTheDocument();
  });

  test("opens and closes logout modal", () => {
    const user = { role: "reporter", name: { first: "John" } };
    renderWithContext({ user, loading: false, logout: jest.fn() });

    const logoutLink = screen.getByText(/logout/i);
    fireEvent.click(logoutLink);

    expect(screen.getByText(/confirm logout/i)).toBeInTheDocument();

    const cancelButton = screen.getByText(/cancel/i);
    fireEvent.click(cancelButton);

    expect(screen.queryByText(/confirm logout/i)).not.toBeInTheDocument();
  });
});
