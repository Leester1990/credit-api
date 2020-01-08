/**
 * 数据库操作的sql
 * @type {{getTableSort: (function(*, *, *): string), updateSql: (function(*, *, *): string), insert: (function(*, *, *): string), getTableData: (function(*, *): string), delData: (function(*, *): string)}}
 */
exports.sql = {
  // insert into list(id,name,nick_name,price) values (0,'部分','化吸','5456')
  insert: function (tableName, key, val) {
    return 'insert into '+tableName+'('+key.join(",")+') values ('+val+')';
  }
};