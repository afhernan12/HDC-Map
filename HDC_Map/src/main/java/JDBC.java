import java.sql.*;

public class JDBC {
	public static final String JDBC_DRIVER = "com.mysql.cj.jdbc.Driver";
	//public static final String JDBC_URL = "jdbc:mysql://3.133.123.66:3306/property_db";
    public static final String JDBC_URL = "jdbc:mysql://172.31.5.105:3306/property_db";
	public static final String USER = "root";
    public static final String PASS = "Super@ngel13!";
	
	private static Connection conn;
	private static Statement st;
	private static ResultSet rs;
	
	public static  ResultSet getLocation() throws ClassNotFoundException {
		System.out.println("in jdbc");
		
		System.out.print(USER + " " + PASS);
		try {			
			Class.forName(JDBC_DRIVER);
			System.out.println("Driver loaded successfully");
			conn = DriverManager.getConnection(JDBC_URL, USER, PASS);
			System.out.println("Connected to database successfully");
	
			st = conn.createStatement();
			rs = st.executeQuery("select * from property");

		} catch (SQLException e) {
			System.out.println(e.getMessage());
			e.printStackTrace();
		} catch (Exception e) {
            System.out.println("General Exception:");
            e.printStackTrace();
            return null;
        }
		return rs;
	}
	
	public static ResultSet getComps() throws ClassNotFoundException {
		System.out.println("in jdbc getComps function");
		
		try {
			Class.forName(JDBC_DRIVER);
			System.out.println("Driver loaded sucess");
			conn = DriverManager.getConnection(JDBC_URL, USER, PASS);
			System.out.println("Connected to Database");
			
			st = conn.createStatement();
			rs = st.executeQuery("select * from comps");

		} catch (SQLException sqle) {
			System.out.println(sqle.getMessage());
			sqle.printStackTrace();
		} catch (Exception err) {
			System.out.println(err.getMessage());
			err.printStackTrace();
		}
		
		return rs;
	}
	
	public static ResultSet getSchool() throws ClassNotFoundException {
		System.out.println("in jdbc get school function");
		
		try {			
			Class.forName(JDBC_DRIVER);
			System.out.println("Driver loaded successfully");
			conn = DriverManager.getConnection(JDBC_URL, USER, PASS);
			System.out.println("Connected to database successfully");
	
			st = conn.createStatement();
			rs = st.executeQuery("select * from school");

		} catch (SQLException e) {
			System.out.println(e.getMessage());
			e.printStackTrace();
		} catch (Exception e) {
            System.out.println("General Exception:");
            e.printStackTrace();
            return null;
        }
		return rs;
	}
	
	public static void closeAll() {
		try {
			if (rs != null) {
				rs.close();
			}
			if (st != null) {
				st.close();
			}
			if (conn != null) {
				conn.close();
			}
		} catch (SQLException sqle) {
			System.out.println(sqle.getMessage());
		}
		
	}
}