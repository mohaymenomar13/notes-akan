<?php
header('Access-Control-Allow-Origin: http://noteakan.ct.ws');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

$hostname = "sql113.infinityfree.com";
$username = "if0_37867212";
$password = "Ngick1301";
$dbname = "if0_37867212_note_akan";

$conn = new mysqli($hostname, $username, $password, $dbname);

if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["message" => "Database connection failed"]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $email = $_POST['email'] ?? '';
    $password = $_POST['password'] ?? '';

    // Prepare and execute SQL statement
    $stmt = $conn->prepare("SELECT * FROM users WHERE email = ? AND password = ?");
    $stmt->bind_param("ss", $email, $password);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $user = $result->fetch_assoc();

        // Set cookie (if still needed for compatibility)
        setcookie("user_session", $user['user_id'], time() + 86400, "/");

        // Return structured JSON response
        http_response_code(200);
        echo json_encode([
            "message" => "Sign-in successful",
            "user_id" => $user['user_id'], // Explicitly send user_id for frontend
        ]);
    } else {
        http_response_code(401);
        echo json_encode(["message" => "Invalid email or password"]);
    }

    $stmt->close();
} else {
    http_response_code(405);
    echo json_encode(["message" => "Only POST method is allowed"]);
}

$conn->close();
?>
