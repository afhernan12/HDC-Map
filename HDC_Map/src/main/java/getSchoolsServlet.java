

import java.io.IOException;
import java.sql.ResultSet;
import java.sql.SQLException;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * Servlet implementation class getSchoolsServlet
 */
@WebServlet("/getSchoolsServlet")
public class getSchoolsServlet extends HttpServlet {
	private static final long serialVersionUID = 1L;
       
    /**
     * @see HttpServlet#HttpServlet()
     */
    public getSchoolsServlet() {
        super();
    }

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doGet(HttpServletRequest request, HttpServletResponse response) 
			throws ServletException, IOException {
		
		System.out.println("in data servlet");
		System.out.println("jdbc:mysql://localhost:3306/property_db");
		
		String data = "";
		ResultSet locations = null;
		try {
			System.out.println("entering JDBC");
			locations = JDBC.getSchool();
			System.out.println("back in servlet");
			data = mySchoolJsonConverter(locations);
		} catch (ClassNotFoundException e) {
			System.out.print(e.getMessage());
		} catch (SQLException e) {
			System.out.println(e.getMessage());
			e.printStackTrace();
		    System.out.println("SQL State: " + e.getSQLState());
		    System.out.println("Error Code: " + e.getErrorCode());
		} finally {
			JDBC.closeAll();
		}
		
		response.setContentType("application/json");
		response.getWriter().write(data);
	}
	
	private String mySchoolJsonConverter(ResultSet rs) throws SQLException {
		String data = "[\n";
		while (rs.next()) {
			data += "{\n\"name\":" + "\"" + rs.getString(2) + "\",";
			data += "\n\"address\":" + "\"" + rs.getString(3) + "\",";
			data += "\n\"lat\":" + "\"" + rs.getString(4) + "\",";
			data += "\n\"lng\":" + "\"" + rs.getString(5) + "\",";
			data += "\n\"category\":" + "\"" + rs.getString(6) + "\"\n},\n";
		}
		
		
		String minusComma = data.substring(0, data.length() - 2);
		minusComma += "\n]";
		//System.out.println(minusComma);
		return minusComma;
	}

	

}
