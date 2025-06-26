

import java.io.IOException;
import java.sql.ResultSet;
import java.sql.SQLException;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * Servlet implementation class getCompsServlet
 */
@WebServlet("/getCompsServlet")
public class getCompsServlet extends HttpServlet {
	private static final long serialVersionUID = 1L;
       
    /**
     * @see HttpServlet#HttpServlet()
     */
    public getCompsServlet() {
        super();
        // TODO Auto-generated constructor stub
    }

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		System.out.println("in comps servlet");
		
		String data = "";
		ResultSet comps = null;
		try {
			System.out.println("entering JDBC");
			comps = JDBC.getComps();
			System.out.println("back in servlet");
			data = myJsonConverter(comps);
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
	
	private String myJsonConverter(ResultSet rs) throws SQLException {
		String data = "[\n";
		while (rs.next()) {
			data += "{\n\"name\":" + "\"" + rs.getString(2) + "\",";
			data += "\n\"address\":" + "\"" + rs.getString(3) + "\",";
			data += "\n\"units\":" + "\"" + rs.getString(4) + "\",";
			data += "\n\"studio_rent\":" + "\"" + rs.getString(5) + "\",";
			data += "\n\"studio_sf\":" + "\"" + rs.getString(6) + "\",";
			data += "\n\"studio_psf\":" + "\"" + rs.getString(7) + "\",";
			data += "\n\"onebr1ba_rent\":" + "\"" + rs.getString(8) + "\",";
			data += "\n\"onebr1ba_sf\":" + "\"" + rs.getString(9) + "\",";
			data += "\n\"onebr1ba_psf\":" + "\"" + rs.getString(10) + "\",";
			data += "\n\"utilities\":" + "\"" + rs.getString(11) + "\",";
			data += "\n\"parking\":" + "\"" + rs.getString(12) + "\",";
			data += "\n\"storage\":" + "\"" + rs.getString(13) + "\",";
			data += "\n\"year\":" + "\"" + rs.getString(14) + "\",";
			data += "\n\"pets\":" + "\"" + rs.getString(15) + "\",";
			data += "\n\"fireplace\":" + "\"" + rs.getString(16) + "\",";
			data += "\n\"washer_dryer\":" + "\"" + rs.getString(17) + "\",";
			data += "\n\"controlled_access\":" + "\"" + rs.getString(18) + "\",";
			data += "\n\"concessions\":" + "\"" + rs.getString(19) + "\",";
			data += "\n\"latitude\":" + "\"" + rs.getString(20) + "\",";
			data += "\n\"longitude\":" + "\"" + rs.getString(21) + "\"\n},\n";
		}
		
		
		String minusComma = data.substring(0, data.length() - 2);
		minusComma += "\n]";
		System.out.println(minusComma);
		return minusComma;
	}
}
