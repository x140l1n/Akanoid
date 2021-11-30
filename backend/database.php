<?php
class Database
{
    private $host = null;
    private $db = null;
    private $user = null;
    private $password = null;
    private $charset = null;

    public function __construct()
    {
        $this->host = constant('DB-HOST');
        $this->db = constant('DB-CATALOG');
        $this->user = constant('DB-USER');
        $this->password = constant('DB-PASSWORD');
        $this->charset = constant('DB-CHARSET');
    }

    /**
     * Connect to the database.
     */
    function connect()
    {
        if (!isset($this->pdo)) {
            try {
                $connection = "mysql:host=" . $this->host . ";dbname=" . $this->db . ";charset=" . $this->charset;
                $options = [
                    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_EMULATE_PREPARES   => false,
                ];

                $pdo = new PDO($connection, $this->user, $this->password, $options);

                return $pdo;
            } catch (PDOException $e) {
                throw $e;
            }
        }
    }

    function __destruct()
    {
        if (isset($this->pdo)) {
            $this->pdo = null;
        }
    }
}
