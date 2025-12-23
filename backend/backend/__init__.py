"""
Thêm lại do lỗi khi init
"""

try:
	import pymysql
	pymysql.install_as_MySQLdb()
except Exception:
	pass
