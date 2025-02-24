<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

$servername = 'localhost';
$username = 'root';
$password = '';
$dbname = 'crud';

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["message" => "Database connection failed"]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] == 'GET') {
    $user_id = $_GET['user_id'];
    $is_public = 1;

    $stmt = $conn->prepare("SELECT * FROM notes WHERE user_id=? AND is_public=?");
    $stmt->bind_param('si', $user_id, $is_public);
    $stmt->execute();
    $result = $stmt->get_result();

    $row = array();
    while ($r = $result->fetch_assoc()) {
        $row[] = $r;
    }
    echo json_encode($row);
    $stmt->close();
}

?>