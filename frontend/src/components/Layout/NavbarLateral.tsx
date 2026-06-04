import Nav from "react-bootstrap/Nav";

interface NavbarLateralProps {
    opciones: string[];
}

function NavbarLateral({ opciones }: NavbarLateralProps) {
    return (
        <div
            style={{
                width: "220px",
                minHeight: "calc(100vh - 56px)",
                backgroundColor: "#6c757d",
                padding: "20px",
                color: "white",
                display: "flex",
                flexDirection: "column",
            }}
        >
        
        <h3>IMOS</h3>

        <p>Menú de opciones</p>

        <Nav className="flex-column">
            {opciones.map((opcion, index) => (
                <Nav.Link
                    key={index}
                    href="#"
                    style={{ color: "white" }}
                    >
                    {opcion}
                </Nav.Link>
            ))}
        </Nav>

        <div style={{ marginTop: "auto" }}>
            <hr />

            <Nav.Link
                href="#"
                style={{ color: "white" }}
                >
                Log out
            </Nav.Link>
        </div>
    </div>
    );
}

export default NavbarLateral;