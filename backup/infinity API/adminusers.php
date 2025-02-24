<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

$hostname = "sql113.infinityfree.com";
$username = "if0_37867212";
$password = "Ngick1301";
$dbname = "if0_37867212_note_akan";

$conn = new mysqli($hostname, $username, $password, $dbname);


if ($_SERVER['REQUEST_METHOD'] == 'GET') {
    $stmt = $conn->prepare("SELECT * FROM users");
    $stmt->execute();
    $result = $stmt->get_result();
    $row = array();
    while ($r = $result->fetch_assoc()) {
        $row[] = $r;
    }
    echo json_encode($row);
    $stmt->close();
} else if ($_SERVER['REQUEST_METHOD'] == 'DELETE') {
    $user_id = $_GET['user_id'];

    $stmt = $conn->prepare("DELETE FROM users WHERE user_id=?");
    $stmt->bind_param("s", $user_id);

    $stmt2 = $conn->prepare("DELETE FROM notes WHERE user_id=?");
    $stmt2->bind_param("s", $user_id);

    $stmt->execute();
    $stmt2->execute();
    $stmt->close();
    $stmt2->close();
    echo json_encode("Successfully deleted user");
} else if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $user_id = $_POST['user_id'];
    $adminId = 1;

    $stmt = $conn->prepare("INSERT INTO adminusers (admin_id, user) VALUES (?, ?)");
    $stmt->bind_param("is", $adminId, $user_id);
    $stmt->execute();
    $stmt->close();
    echo json_encode("Successfully recorded user $adminId, $user_id");
    
}

$conn->close();
?>