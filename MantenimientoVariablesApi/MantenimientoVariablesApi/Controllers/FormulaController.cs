using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MantenimientoVariablesApi.Models;

namespace MantenimientoVariablesApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FormulaController : ControllerBase
    {
        private readonly AppDbContext _context;

        public FormulaController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public ActionResult<IEnumerable<Formula>> GetAll()
        {
            return _context.Formulas.ToList();
        }

        [HttpGet("{id}")]
        public ActionResult<Formula> Get(int id)
        {
            var formula = _context.Formulas.Find(id);
            if (formula == null) return NotFound();
            return formula;
        }

        [HttpPost]
        public ActionResult<Formula> Create(Formula formula)
        {
            formula.CreatedAt = DateTime.UtcNow;
            _context.Formulas.Add(formula);
            _context.SaveChanges();
            return CreatedAtAction(nameof(Get), new { id = formula.Id }, formula);
        }

        [HttpPut("{id}")]
        public IActionResult Update(int id, Formula updated)
        {
            var formula = _context.Formulas.Find(id);
            if (formula == null) return NotFound();
            formula.Name = updated.Name;
            formula.OriginalFormula = updated.OriginalFormula;
            formula.Result = updated.Result;
            _context.SaveChanges();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            var formula = _context.Formulas.Find(id);
            if (formula == null) return NotFound();
            _context.Formulas.Remove(formula);
            _context.SaveChanges();
            return NoContent();
        }
    }
}