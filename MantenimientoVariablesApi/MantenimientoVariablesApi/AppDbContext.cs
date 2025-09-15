using Microsoft.EntityFrameworkCore;
using MantenimientoVariablesApi.Models;

namespace MantenimientoVariablesApi
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Formula> Formulas { get; set; }
    }
}