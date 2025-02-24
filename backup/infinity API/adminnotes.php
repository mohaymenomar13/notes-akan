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
    $stmt = $conn->prepare("SELECT * FROM notes");
    $stmt->execute();
    $result = $stmt->get_result();
    $row = array();
    while ($r = $result->fetch_assoc()) {
        $row[] = $r;
    }
    echo json_encode($row);
    $stmt->close();
} else if ($_SERVER['REQUEST_METHOD'] == 'DELETE') {
    $note_id = $_GET['note_id'];
    $user_id = $_GET['user_id'];
    $admin_id = 1;

    $stmt = $conn->prepare("INSERT INTO adminnotes (admin_id, note) VALUES (?, ?)");
    $stmt->bind_param("is", $admin_id, $note_id);
    $stmt->execute();
    $stmt->close();

    $stmt = $conn->prepare("DELETE FROM notes WHERE user_id=? AND note_id=?");
    $stmt->bind_param("ss", $user_id, $note_id);
    $stmt->execute();
    echo json_encode("Successfully deleted note");
    $stmt->close();
}
$conn->close();
?>