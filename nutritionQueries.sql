use nutrition;
select n.id, n.name, group_concat(distinct c.channel order by c.channel asc), group_concat(distinct p.property)
from nutrition as n
inner join channels as c
on n.id = c.id
inner join properties as p
on n.id = p.id
where n.id < 10
group by n.id, n.name;
