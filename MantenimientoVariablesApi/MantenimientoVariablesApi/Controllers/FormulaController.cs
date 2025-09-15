using Microsoft.AspNetCore.Mvc;
using MantenimientoVariablesApi.Models;

namespace MantenimientoVariablesApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FormulaController : ControllerBase
    {
        private static List<Formula> formulas = new List<Formula>();

        [HttpGet]
        public ActionResult<IEnumerable<Formula>> GetAll() => formulas;

        [HttpGet("{id}")]
        public ActionResult<Formula> Get(int id)
        {
            var formula = formulas.FirstOrDefault(f => f.Id == id);
            if (formula == null) return NotFound();
            return formula;
        }

        [HttpPost]
        public ActionResult<Formula> Create(Formula formula)
        {
            formula.Id = formulas.Count > 0 ? formulas.Max(f => f.Id) + 1 : 1;
            formula.CreatedAt = DateTime.UtcNow;
            formulas.Add(formula);
            return CreatedAtAction(nameof(Get), new { id = formula.Id }, formula);
        }

        [HttpPut("{id}")]
        public IActionResult Update(int id, Formula updated)
        {
            var formula = formulas.FirstOrDefault(f => f.Id == id);
            if (formula == null) return NotFound();
            formula.Name = updated.Name;
            formula.OriginalFormula = updated.OriginalFormula;
            formula.Result = updated.Result;
            return NoContent();
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            var formula = formulas.FirstOrDefault(f => f.Id == id);
            if (formula == null) return NotFound();
            formulas.Remove(formula);
            return NoContent();
        }
    }
}