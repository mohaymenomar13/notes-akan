<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

$servername = "localhost";
$root = "root";
$password = "";
$dbname = "crud";

$conn = new mysqli($servername, $root, $password, $dbname);

if ($_SERVER['REQUEST_METHOD'] == 'GET') {
    $user_id = $_GET['user_id'];

    $stmt = $conn->prepare("SELECT * FROM admin WHERE user_id=?");
    $stmt->bind_param("s", $user_id);
    $stmt->execute();
    $result = $stmt->get_result();
    $row = array();
    while ($r = $result->fetch_assoc()) {
        $row[] = $r;
    }
    echo json_encode(sizeof($row));
    $stmt->close();
}

$conn->close();
?>